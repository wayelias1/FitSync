from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from keys import supabase 
from .paypal_client import PayPalClient
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalhttp import HttpError
from datetime import datetime, date
from .payments import PaymentService
from .historial_payments import payment_service as historial_service

payment_service = PaymentService()

# Definir blueprints
plans_bp = Blueprint('plans', __name__)
create_payment_bp = Blueprint('create_payment', __name__)
user_payments_bp = Blueprint('user_payments', __name__)
exchange_bp = Blueprint('exchange', __name__)
methods_bp = Blueprint('methods', __name__)
historial_bp = Blueprint('historial', __name__)
payment_bp = Blueprint('payment', __name__)
verify_and_upgrade_role_bp = Blueprint('verify_and_upgrade_role', __name__)

# --- ENDPOINTS PÚBLICOS ---

@plans_bp.route('/', methods=['GET'])
def get_plans():
    """Endpoint público: No requiere JWT"""
    try:
        response = supabase.table('subscription_plans').select('*').eq('active', True).execute()
        plans = response.data or []
        for plan in plans:
            plan['price_bsd'] = payment_service.calculate_bsd_price(plan['price_usd'])
        return jsonify(plans), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@methods_bp.route('/', methods=['GET'])
def get_payment_methods():
    try:
        response = supabase.table('payment_methods').select('*').eq('active', True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ENDPOINTS PRIVADOS (Requieren JWT) ---

@create_payment_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "JSON body required"}), 400
    
    # Datos que recibe del frontend
    plan_name = data.get('plan')
    price = data.get('price')
    method_slug = data.get('method')
    details = data.get('details', {})
    
    print(f"📦 DEBUG Datos recibidos: plan='{plan_name}', price={price}, method='{method_slug}'")
    
    # Mapear 'card' a un método existente en la BD
    # Si estás usando tarjeta, mapeamos a 'PayPal' o creamos un método nuevo
    method_mapping = {
        'card': 'PayPal',  # o 'Tarjeta de Crédito' si tienes ese método
        'paypal': 'PayPal',
        'zelle': 'Zelle',
        'movil': 'Pago Móvil',
        'cash': 'Efectivo USD',
        'binance': 'Binance',
        'bank_transfer': 'Transferencia Bancaria'
    }
    
    method_slug_db = method_mapping.get(method_slug, method_slug)
    
    # Para tarjetas simuladas, registrar en la BD como 'PayPal' o crear nuevo método
    if method_slug == 'card':
        print(f"💳 Pago con tarjeta simulada. Detalles: {details}")
        # Marcar como simulado
        details['simulated'] = True
        details['card_last4'] = details.get('last4', '')
        details['card_type'] = details.get('cardType', '')
        
        # Crear ID de transacción simulado si no viene
        if 'transactionId' not in details:
            details['transactionId'] = f"CARD-SIM-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Continuar con el procesamiento normal...
    # (tu código existente para buscar plan y método)
    
    try:
        # 1. Buscar el plan
        plan_resp = supabase.table('subscription_plans')\
            .select('id, name, price_usd, duration_days')\
            .eq('name', plan_name)\
            .eq('price_usd', float(price))\
            .execute()
        
        if not plan_resp.data:
            return jsonify({"error": f"Plan '{plan_name}' no encontrado"}), 404
        
        plan = plan_resp.data[0]
        plan_id = plan['id']
        
        # 2. Buscar método de pago
        method_resp = supabase.table('payment_methods')\
            .select('id, name')\
            .ilike('name', f'%{method_slug_db}%')\
            .execute()
        
        if not method_resp.data:
            # Si no existe el método, crear uno para tarjetas
            if method_slug == 'card':
                # Insertar método 'Tarjeta de Crédito' si no existe
                new_method = supabase.table('payment_methods').insert({
                    'name': 'Tarjeta de Crédito',
                    'currency': 'USD',
                    'active': True
                }).execute()
                
                if new_method.data:
                    payment_method_id = new_method.data[0]['id']
                else:
                    # Fallback a PayPal
                    method_resp = supabase.table('payment_methods')\
                        .select('id')\
                        .ilike('name', '%PayPal%')\
                        .execute()
                    payment_method_id = method_resp.data[0]['id']
            else:
                return jsonify({"error": f"Método de pago no encontrado"}), 404
        else:
            payment_method_id = method_resp.data[0]['id']
        
        # 3. Crear el pago (simulado para tarjetas)
        user_ip = request.remote_addr
        user_agent = request.headers.get('User-Agent')
        
        result, status = payment_service.create_payment_intent(
            user_id=current_user_id,
            plan_id=plan_id,
            payment_method_id=payment_method_id,
            ip_address=user_ip,
            user_agent=user_agent
        )
        
        # Agregar detalles de tarjeta si es simulado
        if method_slug == 'card' and details.get('simulated'):
            result['simulated'] = True
            result['card_details'] = {
                'last4': details.get('last4', ''),
                'type': details.get('cardType', ''),
                'transaction_id': details.get('transactionId', '')
            }
        
        
        return jsonify(result), status
        
    except Exception as e:
        print(f"❌ ERROR en create_order: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

@user_payments_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_payments():
    current_user_id = get_jwt_identity()
    try:
        response = supabase.table('payments')\
            .select('*, subscription_plans(name, price_usd), payment_methods(name)')\
            .eq('id_user', current_user_id)\
            .order('created_at', desc=True)\
            .execute()
        return jsonify(response.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@verify_and_upgrade_role_bp.route('/<int:user_id>', methods=['PUT'])  # Cambia a int
@jwt_required()
def verify_and_upgrade_role(user_id):
    """
    Verifica si el usuario tiene pago completado y actualiza su rol a 2 (usuario pago)
    user_id viene en la URL: /api/verify/25
    """
    try:
        print(f"=== DEBUG VERIFY ROLE ===")
        print(f"User ID desde URL: {user_id} (type: {type(user_id)})")
        
        # El user_id ya viene de la URL, no necesitamos body
        current_user_jwt = get_jwt_identity()
        print(f"JWT Identity: {current_user_jwt}")
        
        # Opcional: verificar que el JWT coincida con el user_id solicitado
        # Pero depende de qué guardes en el JWT
        
        # Buscar pagos completados
        resp = supabase.table('payments')\
            .select('*')\
            .eq('id_user', user_id)\
            .eq('status', 'completed')\
            .limit(1)\
            .execute()
        
        print(f"Resultado búsqueda pagos: {resp.data}")
        
        payments = getattr(resp, 'data', None) or []
        
        if not payments:
            return jsonify({
                "success": False, 
                "message": "No hay pagos completados para este usuario",
                "debug": {"user_id": user_id, "payments_count": 0}
            }), 404
        
        payment = payments[0]
        print(f"Pago encontrado: ID={payment.get('id')}, Fecha={payment.get('payment_date')}")
        
        # Validar fecha de expiración
        expiration_date = payment.get('expiration_date')
        if expiration_date:
            try:
                from datetime import datetime, date
                # Manejar diferentes formatos de fecha
                if 'Z' in expiration_date:
                    exp_date = datetime.fromisoformat(expiration_date.replace('Z', '+00:00')).date()
                else:
                    exp_date = datetime.fromisoformat(expiration_date).date()
                    
                today = date.today()
                print(f"Fecha expiración: {exp_date}, Hoy: {today}")
                
                if exp_date < today:
                    return jsonify({
                        "success": False,
                        "error": "Suscripción expirada",
                        "message": f"Suscripción expiró: {expiration_date}"
                    }), 400
            except ValueError as parse_error:
                print(f"⚠️ Error al parsear fecha: {parse_error}")
        
        # Actualizar rol del usuario
        upd = supabase.table('User').update({
            'id_rol': 2,  # Usuario pago
            'updated_at': datetime.utcnow().isoformat()
        }).eq('id_user', user_id).execute()
        
        print(f"Resultado actualización: {upd.data}")
        
        # También actualizar el pago si es necesario
        supabase.table('payments').update({
            'status': 'verified',
            'verified_at': datetime.utcnow().isoformat()
        }).eq('id', payment['id']).execute()
        
        return jsonify({
            "success": True,
            "message": "Rol actualizado a pago (id_rol=2)",
            "user_id": user_id,
            "payment_id": payment['id'],
            "expiration_date": expiration_date,
            "updated_user": upd.data[0] if upd.data else None
        }), 200
        
    except Exception as e:
        import traceback
        print(f"❌ Error en verify_and_upgrade_role: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": str(e),
            "message": "Error procesando la solicitud"
        }), 500
    

@historial_bp.route('/transactions', methods=['GET'])
def transactions():
    limit = request.args.get('limit', type=int)
    result = historial_service.get_all_transactions(limit=limit)
    return jsonify(result), 200 if result.get('success') else 500

@historial_bp.route('/send-alert', methods=['POST'])
def send_alert():
    body = request.get_json() or {}
    user_id = body.get('user_id') or request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id required'}), 400
    result = historial_service.send_expiration_alert(user_id)
    return jsonify(result), 200 if result.get('success') else 500
