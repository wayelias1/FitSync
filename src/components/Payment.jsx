import '../styles/Payment.css'
import {FaCheck, FaTimes} from 'react-icons/fa'
import { useState } from 'react'

export default function Payment() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    // Mapeo de precios a plan_id (basado en los precios $19, $59, $149)
    const getPlanIdFromPrice = (price) => {
        switch(price) {
            case 19: return 1;  // Plan básico
            case 59: return 2;  // Plan intermedio
            case 149: return 3; // Plan premium
            default: return 1;
        }
    }
const handlePayment = async (price) => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
        const token = localStorage.getItem('token')
        if (!token) {
            setError('You must be logged in to make a payment')
            setLoading(false)
            return
        }

        const planId = getPlanIdFromPrice(price)
        
  const paymentResponse = await fetch('http://localhost:5000/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                plan_id: planId,
                payment_method_id: 'cash' // Para pago en efectivo
            })
        })

        // Verificar si la respuesta es exitosa
        if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json().catch(() => ({}))
            throw new Error(errorData.error || `HTTP ${paymentResponse.status}: Payment failed`)
        }

        const paymentData = await paymentResponse.json()
        
        // Verificar la estructura de la respuesta
        console.log('Payment response:', paymentData)

        // Manejar diferentes escenarios según la respuesta
        if (paymentData.status === 'requires_action' || paymentData.next_action) {
            // Manejar autenticación 3D Secure si es necesario
            setMessage('Payment requires additional authentication. Please check your payment method.')
        } else if (paymentData.status === 'succeeded' || paymentData.success) {
            setMessage('Payment processed successfully!')
            
            // Verificar y actualizar el rol del usuario
            try {
                const verifyResponse = await fetch('http://localhost:5000/api/user/payments/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({})
                })

                if (verifyResponse.ok) {
                    const verifyData = await verifyResponse.json()
                    if (verifyData.success) {
                        setMessage(prev => prev + ' Your account has been upgraded to premium!')
                    } else {
                        setMessage(prev => prev + ` Note: ${verifyData.message}`)
                    }
                }
            } catch (verifyError) {
                console.log('Role update might be delayed:', verifyError)
            }
        } else {
            setMessage('Payment is being processed. Please wait for confirmation.')
        }

    } catch (err) {
        setError(err.message || 'An error occurred during payment')
        console.error('Payment error:', err)
    } finally {
        setLoading(false)
    }
}
    // Componente para cada plan de pago
    const PaymentPlan = ({ price, features, planName = 'Payment' }) => {
        return (
            <div className="Payment-content">
                <div className="payment-header">
                    <h2>{planName}</h2>
                    <span><i>$</i>{price}</span>
                </div>
                <div className="payment-features">
                    {features.map((feature, index) => (
                        <div key={index} className='payment-features-info'>
                            {feature.included ? 
                                <FaCheck className='icon-check'/> : 
                                <FaTimes className='icon-times'/>
                            }
                            <p>{feature.text}</p>
                        </div>
                    ))}
                </div>
                <div className="payment-button">
                    <button 
                        onClick={() => handlePayment(price)}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Get Now'}
                    </button>
                </div>
            </div>
        )
    }

    // Datos de los planes
    const plans = [
        {
            price: 19,
            features: [
                { text: '1 hour individual training', included: true },
                { text: 'Personal plan creation', included: true },
                { text: 'Diet plan creation', included: false },
                { text: 'Free support and advice', included: false },
                { text: 'Health monitoring', included: false }
            ]
        },
        {
            price: 59,
            features: [
                { text: '1 hour individual training', included: true },
                { text: 'Personal plan creation', included: true },
                { text: 'Diet plan creation', included: true },
                { text: 'Free support and advice', included: false },
                { text: 'Health monitoring', included: false }
            ]
        },
        {
            price: 149,
            features: [
                { text: '1 hour individual training', included: true },
                { text: 'Personal plan creation', included: true },
                { text: 'Diet plan creation', included: true },
                { text: 'Free support and advice', included: true },
                { text: 'Health monitoring', included: true }
            ]
        }
    ]

    return (
        <section className="Payment">
            <div className='Payment-container'>
                {plans.map((plan, index) => (
                    <PaymentPlan 
                        key={index}
                        price={plan.price}
                        features={plan.features}
                        planName={`Plan ${index + 1}`}
                    />
                ))}
            </div>
            
            {/* Mensajes de estado */}
            {message && (
                <div className="payment-message success">
                    <p>{message}</p>
                </div>
            )}
            
            {error && (
                <div className="payment-message error">
                    <p>{error}</p>
                </div>
            )}
        </section>
    )
}
