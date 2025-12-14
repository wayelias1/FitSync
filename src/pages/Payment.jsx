import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import '../styles/Payment.css';
import '../styles/PaymentSuccess.css';
import '../styles/PaymentModal.css';

export default function Payment() {
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [message, setMessage] = useState('');

  // En Payment.jsx, REEMPLAZA los planes:
  const plans = [
    { 
      id: 1, 
      price: 5, 
      name: 'Plan Diario', 
      features: [true, true, false, false, false],
      description: 'Acceso por un día'
    },
    { 
      id: 2, 
      price: 15, 
      name: 'Plan Semanal', 
      features: [true, true, true, false, false],
      description: 'Acceso por una semana'
    },
    { 
      id: 3, 
      price: 40, 
      name: 'Plan Mensual', 
      features: [true, true, true, true, false],
      description: 'Acceso completo por un mes'
    },
    { 
      id: 4, 
      price: 102, 
      name: 'Plan Trimestral', 
      features: [true, true, true, true, false],
      description: 'Ahorra 15% - 3 meses'
    },
    { 
      id: 5, 
      price: 360, 
      name: 'Plan Anual', 
      features: [true, true, true, true, true],
      description: 'Ahorra 25% - 1 año'
    },
  ];

  const featureNames = [
    'Acceso a todas las áreas',
    'Clases grupales', 
    'Plan nutricional',
    'App móvil',
    'Suplementación'
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
    setMessage('');
  };

  // FUNCIÓN CORREGIDA - 'plan' debe ser parámetro
  // También actualiza los nombres en las tarjetas:
  const renderPlanCard = (plan) => (
    <div className="Payment-content" key={plan.id}>
      <div className="payment-header">
        <h2>{plan.name}</h2>
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
  

  const handlePaymentSubmit = async (paymentData) => {
    setMessage('Procesando pago...');

    const token = localStorage.getItem('auth_token');
    const rawUser = localStorage.getItem('auth_user');
    
    // DEBUG
    console.log('=== DEBUG PAGO ===');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    console.log('Usuario raw:', rawUser);
    
    if (!token) {
      setMessage('❌ No hay token de autenticación. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!rawUser) {
      setMessage('❌ Información de usuario no encontrada. Redirigiendo...');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      console.log('Usuario parseado:', user);
      
      // Manejar diferentes formatos de ID
      const userId = user.id || user.id_user || user.user_id;
      
      if (!userId) {
        console.error('Usuario sin ID:', user);
        setMessage('❌ Error: Usuario sin ID. Redirigiendo...');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      // Asegurar que selectedPlan existe
      if (!selectedPlan) {
        setMessage('❌ Error: No hay plan seleccionado.');
        return;
      }

      const dataToSend = {
        ...paymentData, 
        plan: selectedPlan.name, 
        price: selectedPlan.price,
        user_id: userId
      };

      console.log('Enviando pago:', dataToSend);

      // 1. Crear el pago
      const response = await fetch('/api/payments/', {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('Respuesta status:', response.status);
      
      // Manejar error 401
      if (response.status === 401) {
        setMessage('❌ Sesión expirada. Por favor inicia sesión nuevamente.');
        localStorage.clear();
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resultado pago:', result);
      
      // 2. Verificar y actualizar rol si el pago fue exitoso
      if (result.success) {
        try {
          const verifyResponse = await fetch(`/api/verify/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({})  // Envía body vacío
          });

          console.log('Verificación status:', verifyResponse.status);

          if (!verifyResponse.ok) {
            const errorText = await verifyResponse.text();
            console.log('Error verificación:', errorText);
            try {
              const errorJson = JSON.parse(errorText);
              console.log('Error JSON:', errorJson);
            } catch (e) {
              console.log('Error no es JSON');
            }
          } else {
            const verifyResult = await verifyResponse.json();
            console.log('✅ Verificación exitosa:', verifyResult);
            
            // Actualizar usuario en localStorage si la verificación fue exitosa
            if (verifyResult.success) {
              const updatedUser = { ...user, id_rol: 2 };
              localStorage.setItem('auth_user', JSON.stringify(updatedUser));
              console.log('✅ Rol actualizado en localStorage');
            }
          }
        } catch (verifyError) {
          console.error('Error verificando rol:', verifyError);
          // No bloquear el éxito del pago por este error
        }

        // Redirigir a página de éxito (incluso si falló la verificación)
        navigate('/payment-success', {
          state: {
            planName: selectedPlan.name,
            price: selectedPlan.price,
            transactionId: result.transaction_id || 'N/A',
            message: result.message || 'Pago completado exitosamente',
          },
        });
      } else {
        setMessage(`❌ Error: ${result.error || result.message || 'Fallo desconocido'}`);
      }
    } catch (error) {
      console.error('Error en pago:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        setMessage('❌ Error de conexión con el servidor. Verifica tu internet.');
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsModalOpen(false);
      setSelectedPlan(null);
    }
  };

  // Verificar token al cargar
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const response = await fetch('/api/token/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.log('Token inválido, redirigiendo...');
          localStorage.clear();
          navigate('/login');
        }
      } catch (error) {
        console.error('Error verificando token:', error);
      }
    };
    
    verifyToken();
  }, [navigate]);

  return (
    <section className="Payment">
      {message && <p className="payment-message">{message}</p>}
      <div className="Payment-container">
        {plans.map(plan => renderPlanCard(plan))}
      </div>

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


