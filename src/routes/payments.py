from datetime import date, timedelta
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalhttp import HttpError
from keys import supabase
from paypal_client import PayPalClient  

class PaymentService(PayPalClient):
    def __init__(self, exchange_rate=24.5):
        super().__init__()
        self.exchange_rate = exchange_rate
        self.paypal_method_id = 1 

    def calculate_bsd_price(self, price_usd):
        return round(price_usd * self.exchange_rate, 2)

    def create_payment_intent(self, user_id, plan_id, payment_method_id):
        try:
            plan_resp = supabase.table('subscription_plans').select('*').eq('id', plan_id).single().execute()
            if not plan_resp.data:
                return {"message": "Plan no encontrado"}, 404
            plan = plan_resp.data

            payment_pending = {
                'id_user': user_id,
                'id_plan': plan_id,
                'payment_method_id': payment_method_id,
                'amount_usd': plan['price_usd'],
                'amount_bsd': self.calculate_bsd_price(plan['price_usd']),
                'status': 'pending',
                'created_at': date.today().isoformat()
            }
            insert_resp = supabase.table('payments').insert(payment_pending).execute()
            payment_id = insert_resp.data[0]['id']

            order_request = OrdersCreateRequest()
            order_request.prefer('return=representation')
            order_request.request_body({
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": str(plan['price_usd'])
                    },
                    "description": plan['name'],
                    "custom_id": str(payment_id)
                }]
            })

            response = self.client.execute(order_request)
            return {"orderID": response.result.id}, 201
        except HttpError as e:
            return {"error": f"Error de PayPal: {e.message}"}, 500
        except Exception as e:
            return {"error": f"Error interno: {str(e)}"}, 500

    def capture_payment(self, order_id):
        try:
            capture_res = self._capture_paypal_order(order_id)
            if capture_res.status != 'COMPLETED':
                return {"error": "Pago no completado"}, 400

            try:
                purchase_unit = capture_res.purchase_units[0]
                payment_id = int(purchase_unit.custom_id)
                paypal_txn_id = purchase_unit.payments.captures[0].id
            except Exception as e:
                return {"error": f"Error en respuesta PayPal: {str(e)}"}, 400

            payment_resp = supabase.table('payments')\
                .select('*, subscription_plans(duration_days)')\
                .eq('id', payment_id).single().execute()

            if not payment_resp.data:
                return {"error": "Pago no encontrado"}, 404
            payment = payment_resp.data

            if payment['payment_method_id'] != self.paypal_method_id:
                return {"error": "Método de pago no coincide"}, 400
            if payment['status'] == 'completed':
                return {"status": "ok", "message": "Pago ya procesado"}, 200

            return self._finalize_payment(payment, paypal_txn_id)
        except HttpError as e:
            return {"error": f"Error PayPal: {e.message}"}, 400
        except Exception as e:
            return {"error": f"Error interno: {str(e)}"}, 500

    def _capture_paypal_order(self, order_id):
        request = OrdersCaptureRequest(order_id)
        request.prefer('return=representation')
        response = self.client.execute(request)
        return response.result

    def _finalize_payment(self, payment, paypal_txn_id):
        try:
            today = date.today()
            duration = payment['subscription_plans']['duration_days']
            expiration = today + timedelta(days=duration)

            update_data = {
                'status': 'completed',
                'reference_code': paypal_txn_id,
                'payment_date': today.isoformat(),
                'expiration_date': expiration.isoformat()
            }
            supabase.table('payments').update(update_data).eq('id', payment['id']).execute()

            return {
                "status": "success",
                "message": "Pago completado y suscripción activada",
                "expiration_date": expiration.isoformat()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar base de datos: {str(e)}"}, 500