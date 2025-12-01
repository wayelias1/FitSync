import React, { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import PaymentModal from '../components/PaymentModal';
import '../styles/Payment.css';
import { useNavigate } from 'react-router-dom';

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

    const token = localStorage.getItem('auth_token');

    // ✅ Si no hay token, redirigimos a login
    if (!token) {
      setMessage('❌ No estás autenticado. Redirigiendo...');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const dataToSend = { ...paymentData, plan: selectedPlan.name, price: selectedPlan.price };
    console.log('Datos a enviar:', dataToSend);

    try {
      // ✅ 1. Llamada principal con JWT
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ⬅️ JWT
        },
        body: JSON.stringify(dataToSend),
      });

      // ✅ Si el token es inválido o expiró
      if (response.status === 401) {
        setMessage('❌ Sesión expirada. Redirigiendo...');
        localStorage.removeItem('auth_token');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      const data = await response.json();

      // ✅ 2. Si es PayPal, completamos el pago
      if (paymentData.method === 'paypal') {
        const completeRes = await fetch('/paypal/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // ⬅️ JWT
          },
          body: JSON.stringify({
            paypal_order_id: paymentData.details.paypalOrderId,
            payer_email: paymentData.details.payerEmail,
            plan_id: selectedPlan.id,
          }),
        });

        if (!completeRes.ok) {
          const err = await completeRes.json();
          setMessage(`❌ Error al guardar PayPal: ${err.error}`);
          return;
        }
      }

      if (response.ok) {
        setMessage(`✅ Pago del plan ${selectedPlan.name} exitoso. Ref: ${data.transaction_id || 'PayPal'}`);
        // ✅ Cierra el modal solo si todo salió bien
        setIsModalOpen(false);
        setSelectedPlan(null);
      } else {
        setMessage(`❌ Error: ${data.error || 'Fallo desconocido'}`);
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