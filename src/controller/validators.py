# validators.py
import re

def validate_password(password_plaintext):
    if len(password_plaintext) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres."
    
    if not re.search(r"[a-z]", password_plaintext):
        return False, "La contraseña debe contener al menos una letra minúscula."
    
    if not re.search(r"[A-Z]", password_plaintext):
        return False, "La contraseña debe contener al menos una letra mayúscula."
    
    if not re.search(r"[^a-zA-Z0-9\s]", password_plaintext):
        return False, "La contraseña debe contener al menos un carácter especial (ej. $, @, !, *)."

    return True, "Contraseña válida."


def validate_phone_number(number):
    """
    Valida un número de teléfono venezolano según los criterios:
    - Comienza con los prefijos: 0414, 0424, 0416, 0412, 0426
    - Tiene máximo 11 dígitos (incluyendo el prefijo)
    - Solo contiene números del 0 al 9
    """
    
    if not number or not isinstance(number, str):
        return False, "El número de teléfono es requerido"
    
    number = number.strip()
    
    if not number.isdigit():
        return False, "El número de teléfono solo debe contener dígitos del 0 al 9"
    
    # if len(number) > 11:
    #     return False, "El número de teléfono debe tener máximo 11 dígitos"
    
    # if len(number) < 10:
    #     return False, "El número de teléfono debe tener al menos 10 dígitos"
    
    valid_prefixes = ['0414', '0424', '0416', '0412', '0426']
    
    has_valid_prefix = False
    for prefix in valid_prefixes:
        if number.startswith(prefix):
            has_valid_prefix = True
            break
    
    if not has_valid_prefix:
        return False, f"El número debe comenzar con uno de los prefijos: {', '.join(valid_prefixes)}"
    
    if len(number) != 11:
        return False, f"El número con prefijo {number[:4]} debe tener exactamente 11 dígitos"
    
    return True, "Número de teléfono válido"