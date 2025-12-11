import sys
import os
import re
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash 
from dotenv import load_dotenv
from keys import supabase
from email_validator import validate_email, EmailNotValidError
from controller.validators import validate_password, validate_phone_number
sign_up = Blueprint('sign_up', __name__)

load_dotenv()

@sign_up.route('/', methods=['POST'])
def signnup():
    try:
        data = request.get_json()
        name = data.get("name")
        last_name = data.get("last_name")
        email = data.get("email")  
        password_plaintext = data.get("password_encrypted") 
        number = data.get("number")
        if not all([name, last_name, email, password_plaintext, number]):
            return jsonify({"message": "Faltan campos por llenar"}), 400
        
        allowed_domains = ["@gmail.com", "@hotmail.com", "@outlook.com", "@yahoo.com"]

        email = (data.get("email") or "").strip()

        # Validar formato general
        import re
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"message": "Formato de email inválido"}), 400

        # Validar dominio permitido
        if not any(email.endswith(domain) for domain in allowed_domains):
            return jsonify({"message": "El correo debe ser de Gmail, Hotmail, Outlook o Yahoo"}), 400
        is_valid, password_message = validate_password(password_plaintext)
        if not is_valid:
            return jsonify({"message": password_message}), 400

        is_valid_phone, phone_message = validate_phone_number(str(number))
        if not is_valid_phone:
            return jsonify({"message": phone_message}), 400

        email = email.lower()
        try:
            email_check = validate_email(email, check_deliverability=True)
            email = email_check.email
        except EmailNotValidError as e:
            return jsonify({"message": f" la dirección de correo no es válida: {str(e)}"}), 400
        
        hashed_password = generate_password_hash(password_plaintext)
        password_encrypted = hashed_password 
        check_response = supabase.table("User").select("email, number").or_(
            f"email.eq.{email},number.eq.{number}"
        ).limit(1).execute()

        existing_users = check_response.data
        if existing_users:
            existing_user = existing_users[0]
            if existing_user.get('email') == email:
                return jsonify({"message": "El email ya está registrado"}), 409

            if str(existing_user.get('number')) == str(number):
                return jsonify({"message": "El número de teléfono ya está registrado"}), 409
            
        user_data = {
            "name": name,
            "last_name": last_name,
            "email": email,
            "password_encrypted": password_encrypted, 
            "number": number,
            "id_rol": 1
        }

        response = supabase.table("User").insert(user_data).execute()
        if response.data:
            user_id = response.data[0].get('id')
            if not user_id:
                user_identity = email 
            else:
                user_identity = user_id
 
            access_token = create_access_token(identity=user_identity)
            
            return jsonify({
                "message": "Usuario creado exitosamente", 
                "user": response.data[0],
                "access_token": access_token 
            }), 201
        else:
            return jsonify({"message": "error al crear usuario"}), 500

    except Exception as e:
        error_str = str(e)
        if "23505" in error_str:
            if "Key (email)=" in error_str or "user_email_key" in error_str.lower():
                return jsonify({"message": "El email ya está registrado"}), 409
            
            if "Key (number)=" in error_str or "User_number_key" in error_str:
                return jsonify({"message": "El número de teléfono ya está registrado"}), 409
        print(f"ERROR al registrar usuario: {e}")
        return jsonify({"message": str(e)}), 500