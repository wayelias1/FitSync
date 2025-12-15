import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import '../styles/Register.css'
import Footer from '../components/Footer'

export function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', last_name: '', email: '', number: '', password: '' })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    if (!form.name.trim() || !form.last_name.trim() || !form.email.trim() || 
    !form.number.trim() || !form.password.trim()) {
      setMsg("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }
    const allowedDomains = ["@gmail.com", "@hotmail.com", "@outlook.com", "@yahoo.com"];

    const validateEmail = (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(email)) return false;
      return allowedDomains.some(domain => email.endsWith(domain));
    };

    const validateNumber = (number) => {
      const regex = /^(0414|0416|0412|0424|0426)\d{7}$/;
      if (!regex.test(number)) return false;
      return true;
    };

    const validatePassword = (value) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      return regex.test(value);
    };

    // Uso en tu handleSubmit
    if (!validateEmail(form.email)) {
      setMsg("El correo debe ser válido y terminar en Gmail, Hotmail, Outlook o Yahoo");
      return;
    }
    if (!validateNumber(form.number)) {
      setMsg("Número inválido. Debe comenzar con numero de operadora valida");
      return;
    }
    if (!validatePassword(form.password)) {
      setMsg("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un caracter especial.");
      return;
    }
    try {
      const payload = {
        ...form,
        password_encrypted: form.password
      };
      delete payload.password;

      const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      navigate('/home')
    } catch (err) {
      setMsg(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="register-container">
        <Link to="/" className="back-button">
          <FaArrowLeft size={30} />
        </Link>
        <h1 style={{ color: 'rgb(31, 29, 29)' }}>Registro</h1>
        <form onSubmit={handleSubmit} className="register">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
          <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Apellido" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          <input name="number" value={form.number} onChange={handleChange} placeholder="Telefono" type="tel" maxLength={11} required />
          <div className='password-field'>
            <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type={showPassword ? 'text' : 'password'} required />
            <button
              type="button"
              className="eye-button"
              onClick={(e) => { e.preventDefault(); setShowPassword(v => !v); }}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          <div className='redirect-container'>
            <a href="/login">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
          <button className='submit' type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
          {msg && <p className='message-error'>{msg}</p>}
        </form>
      </div>
      <Footer />
    </>
  )
}