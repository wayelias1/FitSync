from flask import jsonify, request, Blueprint
from keys import supabase

from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token

from werkzeug.security import check_password_hash

login = Blueprint('login', __name__)


@login.route('/', methods=['POST'])
def Login():
    data = request.get_json()

    email = data.get('email')
    password_plaintext = data.get('password_encrypted')

    try:
        response = supabase.table('User').select('id_user, email, password_encrypted').eq('email', email).execute()
        # response = supabase.table('User').select('*').eq('email', email).eq('password_encrypted', password).execute()
        user = response.data

        # if user:
        #     return jsonify({"message": "Login successful", "user": user[0]}), 200
        # else:
        #     return jsonify({"message": "Invalid email or password"}), 401
        if not user:
            # Usuario no encontrado
            return jsonify({"message": "Invalid email or password"}), 401

        user = user[0]
        stored_hash = user.get('password_encrypted')

        if not check_password_hash(stored_hash, password_plaintext):
            # La contraseña no coincide con el hash
            return jsonify({"message": "Invalid email or password"}), 40
        
        # Usamos el ID del usuario como identidad para el token
        user_identity = user.get('id_user') 
        if user_identity is None:
    # Como respaldo, usa el email si el ID no está disponible
            user_identity = user.get('email')
        if user_identity is not None:
    # Convierte a string si es un número entero
            user_identity_str = str(user_identity)
        access_token = create_access_token(identity=user_identity_str)

        # 4. Login exitoso: Devolver el usuario y el token
        return jsonify({
            "message": "Login successful", 
            "user": user,
            "access_token": access_token # Devolvemos el token
        }), 200

    except Exception as e:
        print(f"ERROR DE SUPABASE: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
