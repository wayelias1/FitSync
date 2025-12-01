import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/Register.css'

export function Register() {
  const navigate = useNavigate()
  useEffect(() => {
   /* fetch('/sign_up') // ruta enpoint register, same example for others components with flask
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err))
*/
  }, [])

  const [form, setForm] = useState({ name:'', last_name:'', email:'', number:'', password:'' })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
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

// ⬅️ Opcional: redirige a home o payment después del registro

      // navegar a /home
      navigate('/home')
    } catch (err) {
      setMsg(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <h1 style={{color: 'rgb(31, 29, 29)'}}>Registro</h1>
      <form onSubmit={handleSubmit} className="register">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" />
        <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Apellido" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input name="number" value={form.number} onChange={handleChange} placeholder="Telefono" type="tel" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" />
        <div>
          <a href="/login">¿Ya tienes cuenta?</a>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  )
}