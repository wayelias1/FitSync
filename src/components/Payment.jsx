import '../styles/Payment.css'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { Link } from 'react-router-dom'


export default function Payment() {

    return (
        <section className="Payment">
            <div className='Payment-container'>
                <div className="Payment-content">
                    <div className="payment-header">
                        <h2>Pagos</h2>
                        <span><i>$</i>19</span>
                    </div>
                    <div className="payment-features">
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>1 hora individual de entrenamiento</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>Plan personal</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaTimes />
                            <p>Dieta plan creation</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaTimes />
                            <p>Apoyo y consejo gratuito</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaTimes />
                            <p>Monitoreo de salud</p>
                        </div>
                    </div>
                    <div className="payment-button">
                        <Link to="/payment">
                            <button>Obtener</button>
                        </Link>
                    </div>
                </div>
                <div className="Payment-content">
                    <div className="payment-header">
                        <h2>Payment</h2>
                        <span><i>$</i>59</span>
                    </div>
                    <div className="payment-features">
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>1 hora individual de entrenamiento</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>Plan personal</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>Diet plan creation</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaTimes />
                            <p>Soporte y asesoramiento gratuito</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaTimes />
                            <p>Monitorio de Salud</p>
                        </div>
                    </div>
                    <div className="payment-button">
                        <Link to="/payment">
                            <button>Obtener</button>
                        </Link>
                    </div>
                </div>
                <div className="Payment-content">
                    <div className="payment-header">
                        <h2>Pagos</h2>
                        <span><i>$</i>149</span>
                    </div>
                    <div className="payment-features">
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>1 hora individual</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>Plan personal</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>Plan de dieta</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>Soporte y asesoramiento gratuito</p>
                        </div>
                        <div className='payment-features-info'>
                            <FaCheck className='icon-check' />
                            <p>Salud Monitoriado</p>
                        </div>
                    </div>
                    <div className="payment-button">
                        <Link to="/payment">
                            <button>Obtener</button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
