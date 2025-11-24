from flask import Blueprint, request, jsonify
from keys import supabase
from payment_service import PaymentService 

payment_service = PaymentService()

plans_bp = Blueprint('plans', __name__)
methods_bp = Blueprint('methods', __name__)
create_payment_bp = Blueprint('create_payment', __name__)
user_payments_bp = Blueprint('user_payments', __name__)
exchange_bp = Blueprint('exchange', __name__)

@plans_bp.route('/', methods=['GET'])
def get_plans():
    try:
        response = supabase.table('subscription_plans').select('*').eq('active', True).execute()
        plans = response.data
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

@create_payment_bp.route('/create', methods=['POST'])
def create_order():
    data = request.get_json()
    if not all(k in data for k in ('user_id', 'plan_id', 'payment_method_id')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    result, status = payment_service.create_payment_intent(
        data['user_id'], data['plan_id'], data['payment_method_id'])
    return jsonify(result), status

@create_payment_bp.route('/capture', methods=['POST'])
def capture_order():
    data = request.get_json()
    order_id = data.get('orderID')
    if not order_id:
        return jsonify({"error": "OrderID requerido"}), 400
    result, status = payment_service.capture_payment(order_id)
    return jsonify(result), status

@exchange_bp.route('/', methods=['GET'])
def get_exchange_rate():
    return jsonify({
        'exchange_rate': payment_service.exchange_rate,
        'last_updated': 'Hoy' 
    }), 200

@user_payments_bp.route('/<int:user_id>', methods=['GET'])
def get_user_payments(user_id):
    try:
        response = supabase.table('payments')\
            .select('*, subscription_plans(*), payment_methods(*)')\
            .eq('id_user', user_id).order('created_at', desc=True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500