import React, { useState } from 'react'
import { useEffect } from 'react'
import '../styles/Register.css'

export function Register() {

  useEffect(() => {
    fetch('/register') // ruta enpoint register, same example for others components with flask
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err))

  }, [])

  const [form, setForm] = useState({ name:'', last_name:'', email:'', number:'', password:'' })
  const [msg, setMsg] = useState(null)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
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
      if (!res.ok) throw new Error(data.message || 'Error')
      setMsg('Registro exitoso')
      setForm({ name:'', last_name:'', email:'', number:'', password:'' })
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="register-container">
      <h1>Registro</h1>
      <form onSubmit={handleSubmit} className="register">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" />
        <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Apellido" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input name="number" value={form.number} onChange={handleChange} placeholder="Telefono" type="tel" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" />
        <div>
          <a href="/login">¿Ya tienes cuenta?</a>
        </div>
        <button type="submit">Registrarse</button>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  )
}