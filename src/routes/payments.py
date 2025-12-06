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
    
    def _log_audit(self, user_id, action, ip_address=None, user_agent=None, metadata=None):
        """Método de logging simple - AGREGADO PARA EVITAR EL ERROR"""
        log_data = {
            'user_id': user_id,
            'action': action,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'metadata': metadata,
            'timestamp': datetime.now().isoformat()
        }
        logger.info(f"Audit log: {log_data}")
    
    def create_payment_intent(self, user_id, plan_id, payment_method_id, ip_address=None, user_agent=None):
        try:
            logger.info(f"Creating payment intent: user={user_id} plan={plan_id} method={payment_method_id}")
            
            # Obtener el plan
            plan_resp = supabase.table('subscription_plans').select('*').eq('id', plan_id).single().execute()
            if not plan_resp.data:
                return {"message": "Plan no encontrado"}, 404
            plan = plan_resp.data
            
            # Verificar método de pago
            method_resp = supabase.table('payment_methods').select('*').eq('id', payment_method_id).single().execute()
            if not method_resp.data:
                return {"message": "Método de pago no válido"}, 400
            
            payment_method = method_resp.data
            
            # Determinar estado inicial basado en el método de pago
            initial_status = 'pending'
            if payment_method['name'].lower() == 'cash':
                initial_status = 'completed'

            # Preparar datos para insertar en Supabase
            payment_data = {
                'id_user': user_id,
                'plan_id': plan_id,
                'payment_method_id': payment_method_id,
                'amount_usd': plan['price_usd'],
                'amount_bsd': self.calculate_bsd_price(plan['price_usd']),
                'status': initial_status,
                'created_at': date.today().isoformat()
            }
            
            # Si es efectivo, añadir fecha de pago y fecha de expiración
            if payment_method['name'].lower() == 'cash':
                today = date.today()
                duration = plan.get('duration_days', 30)
                expiration = today + timedelta(days=duration)
                payment_data['payment_date'] = today.isoformat()
                payment_data['expiration_date'] = expiration.isoformat()
                payment_data['reference_code'] = f'CASH-{user_id}-{datetime.now().strftime("%Y%m%d%H%M%S")}'
            
            # Insertar y obtener el ID generado
            insert_resp = supabase.table('payments').insert(payment_data).execute()
            payment_id = insert_resp.data[0]['id']
            payment_data['id'] = payment_id 
            
            # Si es PayPal, crear orden
            if payment_method['name'].lower() == 'paypal':
                pass  # TODO: Implementar PayPal
            
            response_object = {
                "success": True,
                "message": f"Pago {'completado' if initial_status == 'completed' else 'pendiente'} creado correctamente",
                "payment_id": payment_id,
                "data": payment_data,
                "plan_details": {
                    "name": plan['name'],
                    "price": plan['price_usd'],
                    "duration_days": plan.get('duration_days', 30)
                }
            }
            
            # Si es efectivo y se completó, actualizar rol inmediatamente
            if initial_status == 'completed':
                supabase.table('User').update({'id_rol': 2}).eq('id_user', user_id).execute()
                response_object["role_updated"] = True
            
            return response_object, 201

        except Exception as e:
            self._log_audit(user_id, 'intent_failed_internal', ip_address, user_agent, metadata={'error': str(e)})
            logger.error(f"Payment intent failed: {str(e)}")
            return {"error": f"Error interno: {str(e)}"}, 500
