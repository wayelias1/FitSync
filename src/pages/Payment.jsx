import React, { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import PaymentModal from '../components/PaymentModal';
import '../styles/Payment.css';
import { useNavigate } from 'react-router-dom';
import '../styles/Payment.css';

export default function Payment() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [message, setMessage] = useState('');

  const navigate = useNavigate(); // ⬅️ para redirigir

  const plans = [
    { id: 1, price: 19, name: 'Basic', features: [true, true, false, false, false] },
    { id: 2, price: 59, name: 'Pro', features: [true, true, true, false, false] },
    { id: 3, price: 149, name: 'Premium', features: [true, true, true, true, true] },
  ];

  const featureNames = [
    '1 hour individual training',
    'Personal plan creation',
    'Diet plan creation',
    'Free support and advice',
    'Health monitoring',
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
    setMessage('');
  };

const handlePaymentSubmit = async (paymentData) => {
    setMessage('Procesando pago...');

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

    if (!token) {
        setMessage('❌ No estás autenticado. Redirigiendo...');
        setTimeout(() => navigate('/login'), 1500);
        return;
    }

    // Obtener plan_id basado en el precio
    const getPlanIdFromPrice = (price) => {
        switch(price) {
            case 19: return 1;
            case 59: return 2;
            case 149: return 3;
            default: return 1;
        }
    };

    const planId = getPlanIdFromPrice(selectedPlan.price);
    
    // Mapear método de pago a ID (ajusta según tu base de datos)
    const getPaymentMethodId = (method) => {
        const mapping = {
            'card': 1,
            'bank_transfer': 2,
            'paypal': 3,
            'zelle': 4,
            'movil': 5,
            'cash': 6,
            'binance': 7
        };
        return mapping[method] || 1;
    };

    const paymentMethodId = getPaymentMethodId(paymentData.method);

    try {
        const response = await fetch('http://localhost:5000/api/payments/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                plan_id: planId,
                payment_method_id: paymentMethodId,
                invoice_number: paymentData.details.invoiceNumber,
            }),
        });

        if (response.status === 401) {
            setMessage('❌ Sesión expirada. Redirigiendo...');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('token');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        const data = await response.json();
        console.log('Payment response:', data);

        if (response.ok) {
            // Guardar datos del pago para la página de confirmación
            const paymentInfo = {
                planName: selectedPlan.name,
                price: selectedPlan.price,
                method: paymentData.method,
                reference: data.payment_id || data.reference_code || 'N/A',
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('lastPayment', JSON.stringify(paymentInfo));
            
            setMessage('✅ Pago exitoso! Redirigiendo...');
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
                setIsModalOpen(false);
                setSelectedPlan(null);
                // Redirigir a la página de confirmación
                navigate('/payment-confirmation', { 
                    state: { paymentData: paymentInfo } 
                });
            }, 1500);
            
        } else {
            setMessage(`❌ Error: ${data.error || 'Fallo en el procesamiento del pago'}`);
        }
    } catch (error) {
        console.error('Error de red:', error);
        setMessage('❌ Error de conexión con el servidor.');
    }
};

  const renderPlanCard = (plan) => (
    <div className="Payment-content" key={plan.id}>
      <div className="payment-header">
        <h2>Payment ({plan.name})</h2>
        <span><i>$</i>{plan.price}</span>
      </div>
      <div className="payment-features">
        {plan.features.map((has, i) => (
          <div className="payment-features-info" key={i}>
            {has ? <FaCheck className="icon-check" /> : <FaTimes />}
            <p>{featureNames[i]}</p>
          </div>
        ))}
      </div>
      <div className="payment-button">
        <button onClick={() => handleSelectPlan(plan)}>Get Now</button>
      </div>
    </div>
  );

  return (
    <section className="Payment">
      {message && <p className="feedback-message">{message}</p>}
      <div className="Payment-container">{plans.map(renderPlanCard)}</div>

      {isModalOpen && selectedPlan && (
        <PaymentModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlan(null);
          }}
          onSubmit={handlePaymentSubmit}
          planPrice={selectedPlan.price}
          planName={selectedPlan.name}
        />
      )}
    </section>
  );
}


