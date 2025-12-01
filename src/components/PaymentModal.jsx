import React, { useState } from 'react';
import '../styles/PaymentModal.css';

const PAYMENT_OPTIONS = [
  { value: 'card',      label: '💳 Tarjeta de Crédito/Débito' },
  { value: 'bank_transfer', label: '🏧 Transferencia Bancaria' },
  { value: 'paypal',    label: '🅿️ PayPal' },
  { value: 'zelle',     label: '🏦 Zelle' },
  { value: 'movil',     label: '📱 Pago Móvil' },
  { value: 'cash',      label: '💵 Efectivo USD' },
  { value: 'binance',   label: '₿ Binance' },
];

const PaymentModal = ({ onClose, onSubmit, planPrice, planName }) => {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_OPTIONS[0].value);
  const [paymentDetails, setPaymentDetails] = useState({
    invoiceNumber: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    transferRef: '',
    cashAmount: '',
    movilPhone: '',
    zelleEmail: '',
    binanceRef: '',
  });
  const [loadingPayPal, setLoadingPayPal] = useState(false);

  const handleChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e) => {
    const newMethod = e.target.value;
    setSelectedMethod(newMethod);
    setPaymentDetails(prev => ({
      ...prev,
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      transferRef: '',
      cashAmount: '',
      movilPhone: '',
      zelleEmail: '',
      binanceRef: '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentDetails.invoiceNumber.trim()) {
      alert('Por favor, ingresa el número de Carta de Pago.');
      return;
    }
    onSubmit({
      method: selectedMethod,
      plan: planName,
      price: planPrice,
      details: paymentDetails,
    });
  };

  /* --------------  PAYPAL: sin widget, solo simulación  -------------- */
  const handlePayPalClick = async () => {
    if (!paymentDetails.invoiceNumber.trim()) {
      alert('Por favor, ingresa el número de Carta de Pago.');
      return;
    }
    setLoadingPayPal(true);
    try {
      // 1. Llama a tu endpoint para crear la orden en tu BD
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName, planPrice }),
      });
      const { orderID } = await res.json(); // o approvalUrl si prefieres redirigir

      // 2. Simulamos aprobado (development)
      // En producción aquí rediriges a approvalUrl o abres lightbox
      const captureRes = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID }),
      });
      const capture = await captureRes.json();

      // 3. Guardas en tu base de datos
      onSubmit({
        method: 'paypal',
        plan: planName,
        price: planPrice,
        details: { ...paymentDetails, paypalOrderId: orderID, capture },
      });
    } catch (err) {
      console.error(err);
      alert('Error al procesar PayPal');
    } finally {
      setLoadingPayPal(false);
    }
  };

  /* ----------  Formularios dinámicos (igual que antes)  ---------- */
  const renderPaymentForm = () => {
    const {
      cardNumber,
      cardHolder,
      expiryDate,
      cvv,
      transferRef,
      cashAmount,
      movilPhone,
      zelleEmail,
      binanceRef,
    } = paymentDetails;

    switch (selectedMethod) {
      case 'card':
        return (
          <div className="payment-form">
            <label>Número de Tarjeta:</label>
            <input
              type="text"
              name="cardNumber"
              value={cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />

            <label>Titular de la Tarjeta:</label>
            <input
              type="text"
              name="cardHolder"
              value={cardHolder}
              onChange={handleChange}
              placeholder="Como aparece en la tarjeta"
              required
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
                />
              </div>
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="payment-info-message">
            <p>
              Realiza una transferencia bancaria por <strong>${planPrice}</strong> a:
            </p>
            <ul>
              <li><strong>Banco:</strong> Banco de Venezuela</li>
              <li><strong>Titular:</strong> FitSync C.A.</li>
              <li><strong>Cuenta corriente:</strong> 0112-3456-78-9012345678</li>
              <li><strong>RIF:</strong> J-12345678-9</li>
            </ul>

            <label>Referencia de la transferencia (Obligatorio):</label>
            <input
              type="text"
              name="transferRef"
              value={transferRef}
              onChange={handleChange}
              placeholder="Ej: 1234567890"
              required
            />
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
              disabled={loadingPayPal}
            >
              {loadingPayPal ? 'Procesando...' : `Pagar con PayPal ($${planPrice})`}
            </button>
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
            />
            <hr />
          </div>

          <label htmlFor="paymentMethodSelect">Selecciona el Método de Pago:</label>
          <select
            id="paymentMethodSelect"
            className="method-select"
            value={selectedMethod}
            onChange={handleSelectChange}
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
                disabled={!paymentDetails.invoiceNumber.trim()}
              >
                Confirmar Pago (${planPrice})
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;