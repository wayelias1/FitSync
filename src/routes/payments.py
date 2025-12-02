from datetime import date, timedelta, datetime
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalhttp import HttpError
from keys import supabase
from .paypal_client import PayPalClient
import logging

logger = logging.getLogger(__name__)


class PaymentService:
    def __init__(self, exchange_rate=24.5):
        self.exchange_rate = exchange_rate
        self.paypal_method_id = 1
    def calculate_bsd_price(self, price_usd):
        return round(price_usd * self.exchange_rate, 2)

    def create_payment_intent(self, user_id, plan_id, payment_method_id, ip_address=None, user_agent=None):
        try:
            logger.info(f"Creating payment intent: user={user_id} plan={plan_id} ip={ip_address} ua={user_agent}")
            plan_resp = supabase.table('subscription_plans').select('*').eq('id', plan_id).single().execute()
            if not plan_resp.data:
                return {"message": "Plan no encontrado"}, 404
            plan = plan_resp.data

            # 2. Preparar datos para insertar en Supabase
            payment_data = {
                'id_user': user_id,
                'plan_id': plan_id,
                'payment_method_id': payment_method_id,
                'amount_usd': plan['price_usd'],
                'amount_bsd': self.calculate_bsd_price(plan['price_usd']),
                'status': 'pending',
                'created_at': date.today().isoformat()
            }
            
            # 3. Insertar y obtener el ID generado
            insert_resp = supabase.table('payments').insert(payment_data).execute()
            payment_id = insert_resp.data[0]['id']

            # 4. Configurar la orden de PayPal (Nota: falta la línea de ejecución 'client.execute' en tu snippet original)
            order_request = OrdersCreateRequest()
            order_request.prefer('return=representation')
            order_request.request_body({
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": str(plan['price_usd'])
                    },
                    "description": f"Suscripción: {plan['name']}",
                    "custom_id": str(payment_id)
                }]
            })

            # 5. Construir el Objeto de Respuesta
            # Agregamos el ID generado al objeto de datos para que el frontend lo tenga
            payment_data['id'] = payment_id 
            
            response_object = {
                "success": True,
                "message": "Intención de pago creada correctamente",
                "payment_id": payment_id,
                "data": payment_data,
                "plan_details": {
                    "name": plan['name'],
                    "price": plan['price_usd']
                }
            }
            
            # Retornamos el objeto estructurado
            return response_object, 201

        except HttpError as e:
            self._log_audit(user_id, 'intent_failed_paypal', ip_address, user_agent, metadata={'error': e.message})
            return {"error": f"Error de PayPal: {e.message}"}, 500
        except Exception as e:
            self._log_audit(user_id, 'intent_failed_internal', ip_address, user_agent, metadata={'error': str(e)})
            return {"error": f"Error interno: {str(e)}"}, 500

    def capture_payment(self, order_id, user_id, ip_address=None, user_agent=None):
    
        # ✅ Validar que user_id sea integer
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            self._log_audit(user_id, 'invalid_user_id_format', ip_address, user_agent, metadata={'error': f'User ID is not integer: {user_id}'})
            return {"error": "Formato de ID de usuario inválido"}, 400
        
        
        try:
            #  Ejecutar cobro en PayPal
            req = OrdersCaptureRequest(order_id)
            req.prefer('return=representation')
            capture_res = self.client.execute(req).result
            
            if capture_res.status != 'COMPLETED':
                self._log_audit(user_id, 'capture_failed_status', ip_address, user_agent, metadata={'status': capture_res.status})
                return {"error": "El pago no se completó en PayPal"}, 400

            # Recuperar datos del cobro
            purchase_unit = capture_res.purchase_units[0]
            internal_payment_id = int(purchase_unit.custom_id)
            paypal_txn_id = purchase_unit.payments.captures[0].id

            # Buscar el pago en nuestra DB
            payment_resp = supabase.table('payments')\
                .select('*, subscription_plans(duration_days)')\
                .eq('id', internal_payment_id)\
                .single().execute()

            if not payment_resp.data:
                return {"error": "Pago local no encontrado"}, 404
            
            payment = payment_resp.data

            # SEGURIDAD: Verificar que el usuario logueado es el dueño del pago original
            if payment['id_user'] != user_id:
                self._log_audit(user_id, 'security_breach_attempt', ip_address, user_agent, internal_payment_id, {'msg': 'Usuario intentó capturar pago ajeno'})
                return {"error": "Acceso denegado: Este pago no te pertenece"}, 403

            if payment['status'] == 'completed':
                return {"status": "ok", "message": "Pago ya procesado anteriormente"}, 200

          
            today = date.today()
            duration = payment['subscription_plans']['duration_days']
            expiration = today + timedelta(days=duration)

            supabase.table('payments').update({
                'status': 'completed',
                'reference_code': paypal_txn_id,
                'payment_date': today.isoformat(),
                'expiration_date': expiration.isoformat()
            }).eq('id', internal_payment_id).execute()

            self._log_audit(user_id, 'capture_success', ip_address, user_agent, internal_payment_id, {'txn': paypal_txn_id})
            
            return {
                "status": "success", 
                "message": "Suscripción activada",
                "expiration_date": expiration.isoformat()
            }, 200

        except Exception as e:
            self._log_audit(user_id, 'capture_error_exception', ip_address, user_agent, metadata={'error': str(e)})
            return {"error": f"Error procesando captura: {str(e)}"}, 500