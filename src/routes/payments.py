from datetime import date, timedelta, datetime
from paypalhttp import HttpError
from keys import supabase

class PaymentService:
    def __init__(self, exchange_rate=24.5):
        self.exchange_rate = exchange_rate

    def calculate_bsd_price(self, price_usd):
        return round(price_usd * self.exchange_rate, 2)

    def _log_audit(self, user_id, action, ip_address, user_agent, payment_id=None, metadata=None):
        """Guarda un registro de seguridad en Supabase"""
        try:
            audit_data = {
                'user_id': user_id,
                'payment_id': payment_id,
                'action': action,
                'ip_address': ip_address,
                'user_agent': user_agent,
                'metadata': metadata or {},
                'created_at': datetime.utcnow().isoformat()
            }
            supabase.table('payment_audit_log').insert(audit_data).execute()
        except Exception as e:
            print(f"Error guardando log de auditoría: {e}")

    def create_payment_intent(self, user_id, plan_id, payment_method_id, ip_address=None, user_agent=None):
        try:
            # Obtener el plan
            plan_resp = supabase.table('subscription_plans').select('*').eq('id', plan_id).single().execute()
            if not plan_resp.data:
                return {"message": "Plan no encontrado"}, 404
            
            plan = plan_resp.data
            today = date.today()
            duration = plan['duration_days']
            expiration = today + timedelta(days=duration)

            # Crear pago con status 'completed' directamente
            payment_data = {
                'id_user': user_id,
                'plan_id': plan_id,
                'payment_method_id': payment_method_id,
                'amount_usd': plan['price_usd'],
                'amount_bsd': self.calculate_bsd_price(plan['price_usd']),
                'status': 'completed',
                'created_at': today.isoformat(),
                'payment_date': today.isoformat(),
                'expiration_date': expiration.isoformat()
            }
            
            # Insertar en Supabase
            insert_resp = supabase.table('payments').insert(payment_data).execute()
            payment_id = insert_resp.data[0]['id']
            payment_data['id'] = payment_id
            
            self._log_audit(user_id, 'payment_completed', ip_address, user_agent, payment_id)
            
            return {
                "success": True,
                "message": "Pago completado exitosamente",
                "payment_id": payment_id,
                "data": payment_data,
                "expiration_date": expiration.isoformat()
            }, 201

        except Exception as e:
            self._log_audit(user_id, 'payment_failed', ip_address, user_agent, metadata={'error': str(e)})
            return {"error": f"Error: {str(e)}"}, 500
