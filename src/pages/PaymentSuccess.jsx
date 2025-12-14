import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaClock, FaEnvelope, FaBank } from 'react-icons/fa';
import '../styles/PaymentSuccess.css';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Datos del pago
  const { 
    planName = 'Plan', 
    price = 0, 
    transactionId = 'N/A',
    message = 'Pago procesado exitosamente',
    status = 'completed', // 'pending' o 'completed'
    paymentMethod = '',
    invoiceNumber = ''
  } = location.state || {};

  const handleContinue = () => {
    navigate('/home');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:transferencias@fitsync.com?subject=Comprobante de Transferencia';
  };

  // Determinar icono y título según estado
  const isPending = status === 'pending';
  const title = isPending ? 'Transferencia Registrada' : '¡Pago Completado!';
  const icon = isPending ? <FaClock className="success-icon pending" /> : <FaCheckCircle className="success-icon completed" />;
  
  // Texto según método de pago
  const getMethodText = () => {
    switch(paymentMethod) {
      case 'bank_transfer': return '🏧 Transferencia Bancaria';
      case 'card': return '💳 Tarjeta de Crédito/Débito';
      case 'paypal': return '🅿️ PayPal';
      case 'zelle': return '🏦 Zelle';
      case 'movil': return '📱 Pago Móvil';
      case 'cash': return '💵 Efectivo USD';
      case 'binance': return '₿ Binance';
      default: return paymentMethod || 'Método de pago';
    }
  };

  return (
    <div className="payment-success-container">
      <div className="success-card">
        {icon}
        <h1>{title}</h1>
        
        <div className="success-details">
          <div className="detail-row">
            <span className="label">Plan:</span>
            <span className="value">{planName}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Monto:</span>
            <span className="value">${price} USD</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Método de Pago:</span>
            <span className="value">{getMethodText()}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">ID de Transacción:</span>
            <span className="value transaction-id">{transactionId}</span>
          </div>
          
          {invoiceNumber && (
            <div className="detail-row">
              <span className="label">Carta de Pago:</span>
              <span className="value">{invoiceNumber}</span>
            </div>
          )}
          
          <div className="detail-row">
            <span className="label">Estado:</span>
            <span className={`value status ${isPending ? 'pending' : 'completed'}`}>
              {isPending ? '⏳ Pendiente de Verificación' : '✅ Completado'}
            </span>
          </div>
        </div>

        {/* Mensaje principal */}
        <p className="success-message">
          {isPending 
            ? 'Tu transferencia ha sido registrada exitosamente. Para completar la activación, por favor envía el comprobante de transferencia.'
            : message}
        </p>

        {/* Sección específica para transferencias pendientes */}
        {isPending && paymentMethod === 'bank_transfer' && (
          <div className="transfer-instructions">
            <div className="transfer-header">
              <FaBank className="transfer-icon" />
              <h3>📋 Instrucciones para Completar la Transferencia</h3>
            </div>
            
            <div className="bank-details">
              <div className="bank-detail">
                <span className="bank-label">Banco:</span>
                <span className="bank-value">Banco de Venezuela</span>
              </div>
              
              <div className="bank-detail">
                <span className="bank-label">Titular:</span>
                <span className="bank-value">FitSync C.A.</span>
              </div>
              
              <div className="bank-detail">
                <span className="bank-label">Tipo de Cuenta:</span>
                <span className="bank-value">Corriente</span>
              </div>
              
              <div className="bank-detail">
                <span className="bank-label">Número de Cuenta:</span>
                <span className="bank-value account-number">0102-1234-5678-90123456</span>
              </div>
              
              <div className="bank-detail">
                <span className="bank-label">RIF:</span>
                <span className="bank-value">J-12345678-9</span>
              </div>
              
              <div className="bank-detail">
                <span className="bank-label">Concepto:</span>
                <span className="bank-value">Pago {planName} - Ref: {transactionId}</span>
              </div>
            </div>
            
            <div className="transfer-actions">
              <button onClick={handleContactSupport} className="contact-support-btn">
                <FaEnvelope /> Enviar Comprobante por Email
              </button>
              
              <div className="transfer-note">
                <p><strong>⚠️ Importante:</strong></p>
                <ul>
                  <li>Envía el comprobante a <strong>transferencias@fitsync.com</strong></li>
                  <li>Incluye el ID de transacción: <strong>{transactionId}</strong></li>
                  <li>La activación se completará en 24-48 horas hábiles</li>
                  <li>Recibirás un email de confirmación</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sección para pagos completados */}
        {!isPending && (
          <div className="completion-info">
            <div className="completion-message">
              <p>✅ Tu suscripción ha sido activada exitosamente.</p>
              <p>Ahora tienes acceso completo a todas las funcionalidades premium.</p>
            </div>
            
            <div className="next-steps">
              <h4>Próximos pasos:</h4>
              <ul>
                <li>📅 Agenda tu primera sesión de entrenamiento</li>
                <li>📱 Descarga la app móvil desde tu perfil</li>
                <li>🍎 Accede a tu plan nutricional personalizado</li>
                <li>💪 Comienza a usar las herramientas de seguimiento</li>
              </ul>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="action-buttons">
          {isPending ? (
            <>
              <button onClick={handleContactSupport} className="primary-button">
                <FaEnvelope /> Enviar Comprobante
              </button>
              <button onClick={handleContinue} className="secondary-button">
                Entendido, Continuar
              </button>
            </>
          ) : (
            <button onClick={handleContinue} className="primary-button">
              Continuar al Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}