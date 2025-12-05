from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity


verify_token = Blueprint('verify_token', __name__)


@verify_token.route('/verify', methods=['GET', 'POST'])
@jwt_required()
def verify_token_route():
    try:
        # Obtener la identidad del usuario desde el token JWT
        user_identity = get_jwt_identity()
        
        # Aquí podrías agregar lógica adicional para verificar el usuario en la base de datos si es necesario
        
        return jsonify({
            "message": "Token is valid",
            "user_identity": user_identity
        }), 200
    except Exception as e:
        return jsonify({"message": "Error verifying token", "error": str(e)}), 500
 

