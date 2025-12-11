import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
load_dotenv()
from routes.Bp_modify import Bp_modify
from routes.sign_up import sign_up
from routes.delete_user import delete_user
from routes.get_users import get_users
from routes.login import login
from routes.payment_routes import plans_bp, create_payment_bp, user_payments_bp, exchange_bp, methods_bp, historial_bp, payment_bp, verify_and_upgrade_role_bp
from keys import supabase
from routes.logout import logout_bp
from routes.gallery import gallery
from routes.verify_token import verify_token
from datetime import timedelta 

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'tu_secreto_super_seguro'
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'json']
jwt = JWTManager(app)



SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError('Set url and key environment variables')

app.register_blueprint(verify_token, url_prefix='/api/token')
app.register_blueprint(Bp_modify, url_prefix='/api/user')
app.register_blueprint(sign_up, url_prefix='/signup')
app.register_blueprint(delete_user, url_prefix='/user/delete')
app.register_blueprint(get_users, url_prefix='/user')
app.register_blueprint(login, url_prefix='/Login')
app.register_blueprint(plans_bp, url_prefix='/api/plans') 
app.register_blueprint(create_payment_bp, url_prefix='/api/payments')
app.register_blueprint(user_payments_bp, url_prefix='/api/my-payments')
app.register_blueprint(methods_bp, url_prefix='/api/methods')
app.register_blueprint(exchange_bp, url_prefix='/api/exchange')
app.register_blueprint(historial_bp, url_prefix='/historial')
app.register_blueprint(payment_bp, url_prefix='/api')
app.register_blueprint(verify_and_upgrade_role_bp, url_prefix='/api/verify')
app.register_blueprint(logout_bp, url_prefix='/logout')
app.register_blueprint(gallery, url_prefix='/api/gallery')


@app.route('/api/users', methods=['GET'])
def get_all_users():
    try:
        response = supabase.table('User').select('*').execute()
        user_data = response.data
        
        if user_data:
            return jsonify(user_data), 200
        else:
            return jsonify({"message": "No users found"}), 404

    except Exception as e:
        print(f"ERROR DE SUPABASE: {e}")
        return jsonify({"message": "Internal Server Error"}), 500



@app.route('/api/trainer', methods = ['GET'])
def get_trainer():
    try:
        response = supabase.table('trainer').select('*').execute()
        trainer_data = response.data
        
        if trainer_data:
            return jsonify(trainer_data), 200
        else:
            return jsonify({"message": "No trainers found"}), 404

    except Exception as e:
        print(f"ERROR DE SUPABASE: {e}")
        return jsonify({"message": "Internal Server Error"}), 500



@app.route('/api/nutritionist', methods = ['GET'])
def get_nutritionist():
    try:
        response = supabase.table('nutritionist').select('*').execute()
        nutritionist_data = response.data
        
        if nutritionist_data:
            return jsonify(nutritionist_data), 200
        else:
            return jsonify({"message": "No nutritionists found"}), 404

    except Exception as e:
        print(f"ERROR DE SUPABASE: {e}")
        import traceback
        print("ERROR:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error"}), 500



if __name__ == '__main__':
    app.run(debug=True)
