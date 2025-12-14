import React, { useState } from 'react';
import '../styles/PaymentModal.css';

const PAYMENT_OPTIONS = [
  { value: 'card', label: '💳 Tarjeta de Crédito/Débito' },
  { value: 'bank_transfer', label: '🏧 Transferencia Bancaria' },
  { value: 'paypal', label: '🅿️ PayPal' },
  { value: 'zelle', label: '🏦 Zelle' },
  { value: 'movil', label: '📱 Pago Móvil' },
  { value: 'cash', label: '💵 Efectivo USD' },
  { value: 'binance', label: '₿ Binance' },
];

// Función para validar tarjeta con algoritmo Luhn
const isValidCardNumber = (number) => {
  const clean = number.replace(/\s/g, '');
  if (!/^\d+$/.test(clean)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Validar fecha de expiración
const isValidExpiryDate = (date) => {
  const regex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
  if (!regex.test(date)) return false;
  
  const [month, year] = date.split('/');
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  const expiryYear = parseInt(year, 10);
  const expiryMonth = parseInt(month, 10);
  
  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
  
  return true;
};

// Función para generar ID de transacción
const generateTransactionId = (method) => {
  const prefix = {
    'card': 'CARD',
    'paypal': 'PAYPAL', 
    'zelle': 'ZELLE',
    'movil': 'MOVIL',
    'cash': 'CASH',
    'bank_transfer': 'TRANSFER',
    'binance': 'BINANCE'
  }[method] || 'FS';
  
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Detectar tipo de tarjeta
const getCardType = (number) => {
  const clean = number.replace(/\s/g, '');
  
  if (/^4/.test(clean)) return 'Visa';
  if (/^5[1-5]/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  if (/^3(?:0[0-5]|[68])/.test(clean)) return 'Diners Club';
  if (/^35/.test(clean)) return 'JCB';
  
  return 'Desconocida';
};

const PaymentModal = ({ onClose, onSubmit, planPrice, planName }) => {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_OPTIONS[0].value);
  const [paymentDetails, setPaymentDetails] = useState({
    invoiceNumber: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    transferRef: '',
    transferDate: '', // NUEVO: fecha de transferencia
    cashAmount: '',
    movilPhone: '',
    zelleEmail: '',
    binanceRef: '',
  });
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatear número de tarjeta con espacios
    if (name === 'cardNumber') {
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      setPaymentDetails({ ...paymentDetails, [name]: formatted });
      return;
    }
    
    // Formatear fecha de expiración
    if (name === 'expiryDate') {
      const formatted = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
      setPaymentDetails({ ...paymentDetails, [name]: formatted });
      return;
    }
    
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handleSelectChange = (e) => {
    const newMethod = e.target.value;
    setSelectedMethod(newMethod);
    setCardError('');
    setPaymentDetails(prev => ({
      ...prev,
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      transferRef: '',
      transferDate: '', // Resetear fecha también
      cashAmount: '',
      movilPhone: '',
      zelleEmail: '',
      binanceRef: '',
    }));
  };

  // Procesar tarjeta de crédito (SIMULACIÓN)
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setCardError('');
    
    const { cardNumber, cardHolder, expiryDate, cvv, invoiceNumber } = paymentDetails;
    
    // Validaciones
    if (!invoiceNumber.trim()) {
      alert('Por favor, ingresa el número de Carta de Pago.');
      return;
    }
    
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      setCardError('Por favor completa todos los campos de la tarjeta');
      return;
    }
    
    if (!isValidCardNumber(cardNumber)) {
      setCardError('Número de tarjeta inválido');
      return;
    }
    
    if (!isValidExpiryDate(expiryDate)) {
      setCardError('Fecha de expiración inválida o expirada');
      return;
    }
    
    if (!/^\d{3,4}$/.test(cvv)) {
      setCardError('CVV inválido (3-4 dígitos)');
      return;
    }
    
    if (cardHolder.trim().length < 3) {
      setCardError('Nombre del titular muy corto');
      return;
    }
    
    setLoading(true);
    
    // Simular procesamiento (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Tarjetas de prueba predefinidas
    const testCards = {
      '4111 1111 1111 1111': { status: 'success', message: 'Pago aprobado' },
      '5555 5555 5555 4444': { status: 'success', message: 'Pago aprobado' },
      '3782 822463 10005': { status: 'success', message: 'Pago aprobado' },
      '4000 0000 0000 0002': { status: 'declined', message: 'Tarjeta rechazada' },
      '4000 0000 0000 9995': { status: 'insufficient', message: 'Fondos insuficientes' },
      '4000 0000 0000 0069': { status: 'expired', message: 'Tarjeta expirada' },
      '4000 0000 0000 0127': { status: 'cvv', message: 'CVV incorrecto' },
    };
    
    const cardNumberClean = cardNumber.replace(/\s/g, '');
    let result = testCards[cardNumber] || { status: 'success', message: 'Pago simulado exitoso' };
    
    // Si no está en la lista pero es un número válido, simular éxito
    if (!testCards[cardNumber] && isValidCardNumber(cardNumberClean)) {
      result = { status: 'success', message: 'Pago simulado exitoso' };
    }
    
    if (result.status === 'success') {
      // Generar ID de transacción
      const transactionId = generateTransactionId('card');
      
      onSubmit({
        method: 'card',
        plan: planName,
        price: planPrice,
        details: {
          ...paymentDetails,
          status: 'completed',
          transactionId: transactionId,
          simulated: true,
          cardType: getCardType(cardNumberClean),
          last4: cardNumberClean.slice(-4)
        },
      });
    } else {
      setCardError(`Pago rechazado: ${result.message}`);
    }
    
    setLoading(false);
  };

  // Procesar Transferencia Bancaria
  const handleBankTransferSubmit = async (e) => {
    e.preventDefault();
    
    const { transferRef, transferDate, invoiceNumber } = paymentDetails;
    
    // Validaciones
    if (!invoiceNumber.trim()) {
      alert('Por favor, ingresa el número de Carta de Pago.');
      return;
    }
    
    if (!transferRef.trim()) {
      alert('Por favor, ingresa la referencia/comprobante de transferencia.');
      return;
    }
    
    if (!transferDate) {
      alert('Por favor, selecciona la fecha de transferencia.');
      return;
    }
    
    setLoading(true);
    
    // Simular procesamiento (1.5 segundos)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generar ID de transacción
    const transactionId = generateTransactionId('bank_transfer');
    
    onSubmit({
      method: 'bank_transfer',
      plan: planName,
      price: planPrice,
      details: {
        ...paymentDetails,
        status: 'pending', // Las transferencias quedan pendientes
        transactionId: transactionId,
        simulated: true,
        bank: 'Banco de Venezuela',
        accountNumber: '0102-1234-5678-90123456',
        holder: 'FitSync C.A.',
        rif: 'J-12345678-9'
      },
    });
    
    setLoading(false);
  };

  // Manejar envío según método
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar invoiceNumber para todos los métodos
    if (!paymentDetails.invoiceNumber.trim()) {
      alert('Por favor, ingresa el número de Carta de Pago.');
      return;
    }
    
    if (selectedMethod === 'card') {
      handleCardSubmit(e);
      return;
    }
    
    if (selectedMethod === 'bank_transfer') {
      handleBankTransferSubmit(e);
      return;
    }
    
    if (selectedMethod === 'paypal') {
      handlePayPalClick();
      return;
    }
    
    // Para otros métodos (zelle, movil, cash, binance)
    const transactionId = generateTransactionId(selectedMethod);
    
    onSubmit({
      method: selectedMethod,
      plan: planName,
      price: planPrice,
      details: {
        ...paymentDetails,
        status: 'completed',
        transactionId: transactionId,
        simulated: true
      },
    });
  };

  /* --------------  PAYPAL: sin widget, solo simulación  -------------- */
  const handlePayPalClick = async () => {
    if (!paymentDetails.invoiceNumber.trim()) {
      alert('Por favor, ingresa el número de Carta de Pago.');
      return;
    }
    setLoading(true);
    try {
      // Simular procesamiento PayPal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar ID de transacción
      const transactionId = generateTransactionId('paypal');
      
      onSubmit({
        method: 'paypal',
        plan: planName,
        price: planPrice,
        details: { 
          ...paymentDetails, 
          status: 'completed',
          transactionId: transactionId,
          simulated: true 
        },
      });
    } catch (err) {
      console.error(err);
      alert('Error al procesar PayPal');
    } finally {
      setLoading(false);
    }
  };

  /* ----------  Formularios dinámicos  ---------- */
  const renderPaymentForm = () => {
    const {
      cardNumber,
      cardHolder,
      expiryDate,
      cvv,
      transferRef,
      transferDate,
      cashAmount,
      movilPhone,
      zelleEmail,
      binanceRef,
    } = paymentDetails;

    switch (selectedMethod) {
      case 'card':
        return (
          <div className="payment-form">
            <div className="test-card-notice">
              <p><strong>💳 Tarjetas de prueba para simulación:</strong></p>
              <ul>
                <li><code>4111 1111 1111 1111</code> - Visa (éxito)</li>
                <li><code>5555 5555 5555 4444</code> - Mastercard (éxito)</li>
                <li><code>4000 0000 0000 0002</code> - Rechazada</li>
                <li><code>4000 0000 0000 9995</code> - Sin fondos</li>
                <li>Cualquier fecha futura (MM/AA)</li>
                <li>CVV: Cualquier 3-4 dígitos</li>
              </ul>
            </div>

            <label>Número de Tarjeta:</label>
            <input
              type="text"
              name="cardNumber"
              value={cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
              disabled={loading}
            />

            <label>Titular de la Tarjeta:</label>
            <input
              type="text"
              name="cardHolder"
              value={cardHolder}
              onChange={handleChange}
              placeholder="Como aparece en la tarjeta"
              required
              disabled={loading}
            />

            <div className="two-cols">
              <div>
                <label>Fecha de Expiración:</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={expiryDate}
                  onChange={handleChange}
                  placeholder="MM/AA"
                  maxLength={5}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label>CVV:</label>
                <input
                  type="text"
                  name="cvv"
                  value={cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength={4}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            {cardError && <div className="card-error-message">{cardError}</div>}
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="payment-info-message">
            <p style={{ marginBottom: '15px', color: '#333', fontWeight: '500' }}>
              Realiza una transferencia bancaria por <strong style={{ color: '#667eea' }}>${planPrice} USD</strong> a:
            </p>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>Banco:</span>
                <span>Banco de Venezuela</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>Titular:</span>
                <span>FitSync C.A.</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>Tipo de Cuenta:</span>
                <span>Corriente</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>Número:</span>
                <span style={{ fontFamily: 'monospace', color: '#333' }}>0102-1234-5678-90123456</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>RIF:</span>
                <span>J-12345678-9</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>Concepto:</span>
                <span>Pago {planName}</span>
              </div>
            </div>
            
            <div style={{ 
              background: '#e8f5e9', 
              padding: '12px 15px', 
              borderRadius: '6px', 
              marginBottom: '20px',
              border: '1px solid #c8e6c9'
            }}>
              <p style={{ margin: 0, color: '#2e7d32', fontSize: '14px' }}>
                <strong>⚠️ IMPORTANTE:</strong> Envía el comprobante a <strong>transferencias@fitsync.com</strong>
              </p>
            </div>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Referencia/Comprobante (Obligatorio):
            </label>
            <input
              type="text"
              name="transferRef"
              value={transferRef}
              onChange={handleChange}
              placeholder="Ej: TRF-2025-00123"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
                marginBottom: '15px'
              }}
            />
            
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Fecha de Transferencia:
            </label>
            <input
              type="date"
              name="transferDate"
              value={transferDate}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
                marginBottom: '20px'
              }}
            />
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              background: '#fff3cd',
              padding: '10px 15px',
              borderRadius: '6px',
              border: '1px solid #ffeaa7'
            }}>
              <span style={{ fontSize: '20px' }}>⏳</span>
              <span style={{ fontSize: '14px', color: '#856404' }}>
                La activación se completará en 24-48 horas después de verificar el comprobante
              </span>
            </div>
          </div>
        );

      case 'cash':
        return (
          <div className="payment-info-message">
            <p>El pago en <strong>Efectivo USD</strong> se confirmará en persona durante tu primera sesión de entrenamiento.</p>
            <label>Monto Entregado (opcional):</label>
            <input
              type="number"
              name="cashAmount"
              value={cashAmount}
              onChange={handleChange}
              placeholder={`Monto a pagar: $${planPrice}`}
              disabled={loading}
            />
          </div>
        );

      case 'movil':
        return (
          <div className="payment-info-message">
            <p>Realiza tu <strong>Pago Móvil</strong> de <strong>${planPrice}</strong> a:</p>
            <ul>
              <li><strong>Banco:</strong> 0105</li>
              <li><strong>Teléfono:</strong> 0412-123-4567</li>
              <li><strong>C.I.:</strong> V-12.345.678</li>
            </ul>
            <label>Número de Teléfono Usado para el Pago (Obligatorio):</label>
            <input
              type="text"
              name="movilPhone"
              value={movilPhone}
              onChange={handleChange}
              placeholder="Ej: 04121234567"
              required
              disabled={loading}
            />
          </div>
        );

      case 'zelle':
        return (
          <div className="payment-info-message">
            <p>Envía <strong>${planPrice}</strong> a la siguiente cuenta de Zelle:</p>
            <ul>
              <li><strong>Email:</strong> zelle@fitsync.com</li>
              <li><strong>Nombre:</strong> FitSync LLC</li>
            </ul>
            <label>Tu Correo Electrónico de Zelle (Obligatorio):</label>
            <input
              type="email"
              name="zelleEmail"
              value={zelleEmail}
              onChange={handleChange}
              placeholder="tu.email@ejemplo.com"
              required
              disabled={loading}
            />
          </div>
        );

      case 'binance':
        return (
          <div className="payment-info-message">
            <p>Transfiere <strong>${planPrice}</strong> (o su equivalente en USDT) a la siguiente ID de pago de Binance:</p>
            <ul>
              <li><strong>Binance Pay ID:</strong> 123456789</li>
              <li><strong>Red Preferida:</strong> BEP20 (BNB Smart Chain)</li>
            </ul>
            <label>ID de Transacción de Binance (Obligatorio):</label>
            <input
              type="text"
              name="binanceRef"
              value={binanceRef}
              onChange={handleChange}
              placeholder="Hash de la transacción (TxID)"
              required
              disabled={loading}
            />
          </div>
        );

      case 'paypal':
        return (
          <div className="paypal-box">
            <button
              type="button"
              className="paypal-sim-btn"
              onClick={handlePayPalClick}
              disabled={loading}
            >
              {loading ? 'Procesando...' : `Simular PayPal ($${planPrice})`}
            </button>
            <p className="paypal-note">Nota: Esta es una simulación. En producción se integraría con PayPal real.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💸 Pago del Plan {planName} - <strong>${planPrice}</strong></h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="invoice-section">
            <label>Número de Carta de Pago:</label>
            <input
              type="text"
              name="invoiceNumber"
              value={paymentDetails.invoiceNumber}
              onChange={handleChange}
              required
              placeholder="Ej: 2025-00123"
              disabled={loading}
            />
            <hr />
          </div>

          <label htmlFor="paymentMethodSelect">Selecciona el Método de Pago:</label>
          <select
            id="paymentMethodSelect"
            className="method-select"
            value={selectedMethod}
            onChange={handleSelectChange}
            disabled={loading}
          >
            {PAYMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="payment-form-area">{renderPaymentForm()}</div>

          {selectedMethod !== 'paypal' && (
            <div className="modal-footer">
              <button
                type="submit"
                disabled={!paymentDetails.invoiceNumber.trim() || loading}
                className={loading ? 'loading' : ''}
              >
                {loading ? 'Procesando...' : `Confirmar Pago ($${planPrice})`}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;