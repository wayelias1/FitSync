from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from typing import Dict, Any, Optional
import logging

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PaymentService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.alert_days = 3
        self.default_limit = 100
        self.date_format = '%Y-%m-%d'

    def get_all_transactions(self, limit: int = None) -> Dict[str, Any]:
        """Consulta todas las transacciones"""
        try:
            limit = limit or self.default_limit
            response = (self.supabase.table('payments')
                       .select('*')
                       .order('payment_date', desc=True)
                       .limit(limit)
                       .execute())
            
            data = getattr(response, 'data', None) or []
            return {
                'success': True,
                'data': data,
                'count': len(data)
            }
        except Exception as e:
            logger.error(f"Error obteniendo transacciones: {e}")
            return {'success': False, 'error': 'Error interno del servidor'}

    def get_payments_by_date_range(self, start_date: str, end_date: Optional[str] = None) -> Dict[str, Any]:
        """Filtra pagos por rango de fechas"""
        try:
            query = (self.supabase.table('payments')
                    .select('*')
                    .gte('payment_date', start_date))
            
            if end_date:
                query = query.lte('payment_date', end_date)
            
            response = query.order('payment_date', desc=True).execute()
            
            data = getattr(response, 'data', None) or []
            return {
                'success': True,
                'data': data,
                'count': len(data)
            }
        except Exception as e:
            logger.error(f"Error filtrando por fecha: {e}")
            return {'success': False, 'error': 'Error interno del servidor'}

    def get_user_last_payment(self, user_id: str) -> Dict[str, Any]:
        """Última fecha de pago de un usuario"""
        try:
            if not user_id:
                return {'success': False, 'error': 'user_id es requerido'}
                
            response = (self.supabase.table('payments')
                       .select('payment_date, expiration_date, status, amount_usd, plan_id')
                       .eq('id_user', user_id)
                       .order('payment_date', desc=True)
                       .limit(1)
                       .execute())
            
            if response.data:
                last_payment = response.data[0]
                return {
                    'success': True,
                    'last_payment_date': last_payment['payment_date'],
                    'expiration_date': last_payment['expiration_date'],
                    'status': last_payment['status']
                }
            else:
                return {
                    'success': False,
                    'message': 'No se encontraron pagos para este usuario',
                    'title': 'Sin Historial de Pagos'
                }
        except Exception as e:
            logger.error(f"Error obteniendo último pago: {e}")
            return {'success': False, 'error': 'Error interno del servidor'}

    def check_subscription_expiration(self, user_id: str) -> Dict[str, Any]:
        """Valida si la suscripción está por expirar"""
        try:
            if not user_id:
                return {'success': False, 'error': 'user_id es requerido'}
                
            today = datetime.now().date()
            
            response = (self.supabase.table('payments')
                       .select('payment_date, expiration_date, status')
                       .eq('id_user', user_id)
                       .order('expiration_date', desc=True)
                       .limit(1)
                       .execute())
            
            if not response.data:
                return {
                    'expired': True,
                    'days_left': 0,
                    'title': 'Sin Suscripción Activa',
                    'message': 'No tienes pagos registrados. Renueva tu suscripción.'
                }
            
            last_payment = response.data[0]
            expiration_date = datetime.strptime(last_payment['expiration_date'], self.date_format).date()
            days_left = (expiration_date - today).days
            
            if last_payment['status'] != 'completed' or days_left < 0:
                return {
                    'expired': True,
                    'days_left': max(0, days_left),
                    'title': 'Suscripción Expirada',
                    'message': f'Tu suscripción expiró hace {abs(days_left)} días. Renueva ahora.'
                }
            
            if 0 <= days_left <= self.alert_days:
                return {
                    'expired': False,
                    'days_left': days_left,
                    'title': '¡Renueva Pronto!',
                    'message': f'Tu suscripción expira en {days_left} días. Renueva para no perder acceso.'
                }
            
            return {
                'expired': False,
                'days_left': days_left,
                'title': 'Suscripción Activa',
                'message': 'Todo está en orden.'
            }
        except Exception as e:
            logger.error(f"Error verificando expiración: {e}")
            return {'success': False, 'error': 'Error interno del servidor'}

    def send_expiration_alert(self, user_id: str) -> Dict[str, Any]:
        """Envía alerta por correo"""
        try:
            if not user_id:
                return {'success': False, 'error': 'user_id es requerido'}
                
            # Obtener datos del usuario
            user_response = (self.supabase.table('User')
                           .select('email, name')
                           .eq('id_user', user_id)
                           .execute())
            
            if not user_response.data:
                return {'success': False, 'error': 'Usuario no encontrado'}
            
            user = user_response.data[0]
            expiration_data = self.check_subscription_expiration(user_id)
            
            
            if expiration_data.get('expired') is True:
                # decide si quieres enviar alerta solo si está por expirar o si está expirado
                # si quieres enviar solo cuando esté por expirar:
                if expiration_data['days_left'] <= self.alert_days and expiration_data['days_left'] > 0:
                    # continuar con el envío
                    # Configurar email
                    msg = MIMEText(f"Hola {user['name']},\n\n{expiration_data['message']}\n\nSaludos,\nEquipo")
                    msg['Subject'] = expiration_data['title']
                    msg['From'] = os.getenv('SMTP_USER')
                    msg['To'] = user['email']
                    
                    # Enviar email
                    smtp_server = os.getenv('SMTP_SERVER')
                    smtp_port = os.getenv('SMTP_PORT')
                    smtp_user = os.getenv('SMTP_USER')
                    smtp_pass = os.getenv('SMTP_PASS')

                    if not smtp_server or not smtp_port or not smtp_user or not smtp_pass:
                        return {'success': False, 'error': 'Faltan credenciales SMTP'}

                    server = smtplib.SMTP(smtp_server, int(smtp_port))
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
                    server.quit()
                    
                    logger.info(f"Alerta enviada a {user['email']}")
                    return {'success': True, 'message': 'Alerta enviada correctamente'}
                else:
                    return {'success': False, 'message': 'No aplicar alerta en este estado'}
            
        except Exception as e:
            logger.error(f"Error enviando email: {e}")
            return {'success': False, 'error': f'Error enviando email: {str(e)}'}

# Inicialización
try:
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError("Faltan credenciales de Supabase")
        
    supabase_client = create_client(supabase_url, supabase_key)
    payment_service = PaymentService(supabase_client)
    
except Exception as e:
    logger.error(f"Error inicializando Supabase: {e}")
    raise

