from flask import jsonify, request, Blueprint
from keys import supabase
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import check_password_hash
import traceback


login = Blueprint('login', __name__)

@login.route('/', methods=['POST'], strict_slashes=False)
def Login():
    try:
        data = request.get_json(silent=True) or {}
        email = data.get("email")
        #password_plaintext = data.get('password_encrypted')
        password_plaintext = data.get('password') or data.get('password_encrypted')

        if not email or not password_plaintext:
            return jsonify({"message": "Email o contraseña son necesarios"}), 400
        
        response = supabase.table('User').select('id_user, name, email, password_encrypted').eq('email', email).limit(1).execute()
        # response = supabase.table('User').select('*').eq('email', email).eq('password_encrypted', password).execute()
        user = response.data

        rows = getattr(response, 'data', None) or (response.get('data') if hasattr(response, 'get') else None) or []
        if not rows:
            return jsonify({"message": "Email o contraseña inválidos"}), 401

        # if user:
        #     return jsonify({"message": "Login successful", "user": user[0]}), 200
        # else:
        #     return jsonify({"message": "Invalid email or password"}), 401
        if not user:
            # Usuario no encontrado
            return jsonify({"message": "Email invalido o contraseña invalida"}), 401

        user = rows[0]
        #user = user[0]
        stored_hash = user.get('password_encrypted') or ''

        if not stored_hash or not check_password_hash(stored_hash, password_plaintext):
            # La contraseña no coincide con el hash
            return jsonify({"message": "Email invalido o contraseña invalida"}), 401
        
        # Usamos el ID del usuario como identidad para el token
        user_identity = user.get('id_user') 
        if user_identity is None:
    # Como respaldo, usa el email si el ID no está disponible
            user_identity = user.get('email')
        if user_identity is not None:
    # Convierte a string si es un número entero
            user_identity_str = str(user_identity)
        access_token = create_access_token(identity=user_identity_str)


        # no devolver el hash al cliente
        user.pop('password_encrypted', None)

        # 4. Login exitoso: Devolver el usuario y el token
        return jsonify({
            "message": "Login successful", 
            "user": user,
            "name": user.get('name'),
            "access_token": access_token # Devolvemos el token
        }), 200

    except Exception as e:
        print(f"ERROR DE SUPABASE: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
