from datetime import date, timedelta, datetime
from paypalhttp import HttpError
from keys import supabase
from .paypal_client import PayPalClient
import logging

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
            
            # ⭐⭐ MODIFICAR DURACIÓN AQUÍ (AUMENTAR TIEMPO) ⭐⭐
            # Ejemplo: Duplicar la duración
            duration = duration * 2  # ← Cambia esto según necesites
            # O usar tiempo fijo: duration = 365  # 1 año
            # O agregar días extra: duration = duration + 30
            
            expiration = today + timedelta(days=duration)

            # Obtener nombre del método de pago
            try:
                method_resp = supabase.table('payment_methods').select('name').eq('id', payment_method_id).single().execute()
                method_name = method_resp.data.get('name', '') if method_resp.data else ''
            except:
                method_name = ''

            # Determinar status basado en el método de pago
            # Transferencias bancarias quedan como pendientes
            if 'Transferencia' in method_name or 'transfer' in method_name.lower():
                status = 'pending'
                print(f"🏧 Transferencia bancaria registrada como PENDIENTE para usuario {user_id}")
            else:
                status = 'completed'

            # Crear pago
            payment_data = {
                'id_user': user_id,
                'plan_id': plan_id,
                'payment_method_id': payment_method_id,
                'amount_usd': plan['price_usd'],
                'amount_bsd': self.calculate_bsd_price(plan['price_usd']),
                'status': status,
                'created_at': today.isoformat(),
                'payment_date': today.isoformat() if status == 'completed' else None,
                'expiration_date': expiration.isoformat()
            }
            
            # Insertar en Supabase
            insert_resp = supabase.table('payments').insert(payment_data).execute()
            payment_id = insert_resp.data[0]['id']
            payment_data['id'] = payment_id
            
            # Log de auditoría
            self._log_audit(user_id, f'payment_{status}', ip_address, user_agent, payment_id)
            
            # Si es completado, actualizar rol del usuario
            if status == 'completed':
                try:
                    supabase.table('User').update({
                        'id_rol': 2,  # Usuario pago
                        'updated_at': datetime.utcnow().isoformat()
                    }).eq('id_user', user_id).execute()
                    print(f"✅ Rol actualizado a premium para usuario {user_id}")
                except Exception as role_error:
                    print(f"⚠️ Error actualizando rol: {role_error}")
                    # No fallar el pago por error en actualización de rol
            
            # Generar ID de transacción según método
            if 'Transferencia' in method_name:
                transaction_prefix = 'TRF'
            elif 'PayPal' in method_name:
                transaction_prefix = 'PP'
            elif 'Tarjeta' in method_name:
                transaction_prefix = 'CARD'
            elif 'Zelle' in method_name:
                transaction_prefix = 'ZELLE'
            elif 'Móvil' in method_name:
                transaction_prefix = 'MOVIL'
            elif 'Efectivo' in method_name:
                transaction_prefix = 'CASH'
            elif 'Binance' in method_name:
                transaction_prefix = 'BNB'
            else:
                transaction_prefix = 'FS'
            
            transaction_id = f"{transaction_prefix}{payment_id:06d}"
            
            # Respuesta diferente para transferencias pendientes
            if status == 'pending':
                return {
                    "success": True,
                    "message": "Transferencia registrada como pendiente. Por favor envía el comprobante a transferencias@fitsync.com para completar la activación.",
                    "payment_id": payment_id,
                    "transaction_id": transaction_id,
                    "expiration_date": expiration.isoformat(),
                    "status": "pending",
                    "requires_verification": True,
                    "method_name": method_name
                }, 201
            
            # Respuesta para pagos completados
            return {
                "success": True,
                "message": "Pago completado exitosamente",
                "payment_id": payment_id,
                "transaction_id": transaction_id,
                "expiration_date": expiration.isoformat(),
                "status": "completed",
                "method_name": method_name
            }, 201

        except Exception as e:
            self._log_audit(user_id, 'payment_failed', ip_address, user_agent, metadata={'error': str(e)})
            print(f"❌ Error en create_payment_intent: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": f"Error: {str(e)}"}, 500
