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
    print(f"🔐 DEBUG JWT: '{current_user_id}' (type: {type(current_user_id)})")
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400
        
    plan_id = data.get('plan_id')
    payment_method_id = data.get('payment_method_id')
    
    if not plan_id or not payment_method_id:
        return jsonify({"error": "Missing plan_id or payment_method_id"}), 400
    
    user_ip = request.remote_addr
    user_agent = request.headers.get('User-Agent')

    result, status = payment_service.create_payment_intent(
        user_id=current_user_id,
        plan_id=plan_id,
        payment_method_id=payment_method_id,
        ip_address=user_ip,
        user_agent=user_agent
    )
    return jsonify(result), status

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

@verify_and_upgrade_role_bp.route('/<string:user_id>', methods=['PUT'])
@jwt_required()
def verify_and_upgrade_role(user_id):
    """
    Verifica si el usuario tiene pago completado y actualiza su rol a 2 (usuario pago)
    """
    try:
        body = request.get_json() or {}
        user_id = body.get('user_id') or get_jwt_identity()

        if not user_id:
            return jsonify({"error": "user_id required or present in JWT"}), 400

    
        resp = supabase.table('payments')\
            .select('*')\
            .eq('id_user', user_id)\
            .eq('status', 'completed')\
            .limit(1)\
            .execute()
        
        payments = getattr(resp, 'data', None) or []
        if not payments:
            return jsonify({
                "success": False, 
                "message": "No hay pagos completados para este usuario"
            }), 404
        
        payment = payments[0]
        
        # ✅ VALIDACIÓN 5: Pago no expirado
        expiration_date = payment.get('expiration_date')
        if expiration_date:
            try:
                exp_date = datetime.fromisoformat(expiration_date).date()
                if exp_date < date.today():
                    return jsonify({
                        "success": False,
                        "error": "Suscripción expirada",
                        "message": f"Suscripción expiró: {expiration_date}"
                    }), 400
            except ValueError as parse_error:
                print(f"⚠️ Advertencia: Error al parsear fecha: {parse_error}")
        
        # ✅ VALIDACIÓN 6: Actualizar rol y timestamp
        upd = supabase.table('User').update({
            'id_rol': 2,
            'updated_at': datetime.utcnow().isoformat()
        }).eq('id_user', user_id).execute()
        
        return jsonify({
            "success": True,
            "message": "Rol actualizado a pago (id_rol=2)",
            "user_id": user_id,
            "payment_id": payment['id'],
            "expiration_date": expiration_date,
            "updated": upd.data
        }), 200
        
    except Exception as e:
        import traceback
        print(f"❌ Error en verify_and_upgrade_role: {e}")
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
