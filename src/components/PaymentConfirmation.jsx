import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/PaymentConfirmation.css';


export default function PaymentConfirmation() {
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtener datos del pago del localStorage o location state
        const storedPayment = localStorage.getItem('lastPayment');
        if (storedPayment) {
            setPaymentData(JSON.parse(storedPayment));
        } else if (location.state?.paymentData) {
            setPaymentData(location.state.paymentData);
        }
        setLoading(false);

        // Limpiar localStorage después de 5 segundos
        const timer = setTimeout(() => {
            localStorage.removeItem('lastPayment');
        }, 5000);

        return () => clearTimeout(timer);
    }, [location]);

    if (loading) {
        return (
            <div className="confirmation-container">
                <div className="loading-spinner"></div>
                <p>Cargando confirmación...</p>
            </div>
        );
    }

    return (
        <div className="confirmation-container">
            <div className="confirmation-card">
                <div className="confirmation-header">
                    <h1>✅ Pago Completado Exitosamente</h1>
                    <p>Tu suscripción ha sido activada</p>
                </div>
                
                {paymentData && (
                    <div className="confirmation-details">
                        <h2>Detalles del Pago</h2>
                        <div className="detail-row">
                            <span>Plan:</span>
                            <strong>{paymentData.planName}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Monto:</span>
                            <strong>${paymentData.price}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Método de Pago:</span>
                            <strong>{paymentData.method}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Fecha:</span>
                            <strong>{new Date().toLocaleDateString()}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Referencia:</span>
                            <strong>{paymentData.reference || 'N/A'}</strong>
                        </div>
                    </div>
                )}
                
                <div className="confirmation-actions">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary"
                    >
                        Ir al Dashboard
                    </button>
                    <button 
                        onClick={() => navigate('/profile')}
                        className="btn-secondary"
                    >
                        Ver Mi Perfil
                    </button>
                    <button 
                        onClick={() => navigate('/training')}
                        className="btn-secondary"
                    >
                        Comenzar Entrenamiento
                    </button>
                </div>
                
                <div className="confirmation-note">
                    <p>📧 Recibirás un correo electrónico con los detalles de tu suscripción.</p>
                    <p>🔄 Tu cuenta ha sido actualizada automáticamente a premium.</p>
                </div>
            </div>
        </div>
    );
}