import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import '../styles/Register.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', last_name: '', email: '', number: '', password: '' })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

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

    // Uso en tu handleSubmit
    if (!validateEmail(form.email)) {
      setMsg("El correo debe ser válido y terminar en Gmail, Hotmail, Outlook o Yahoo");
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
          <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" />
          <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Apellido" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
          <input name="number" value={form.number} onChange={handleChange} placeholder="Telefono" type="tel" />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" />
          <div className='redirect-container'>
            <a href="/login">¿Ya tienes cuenta?</a>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
          {msg && <p className='message-error'>{msg}</p>}
        </form>
      </div>
      <Footer />
    </>
  )
}