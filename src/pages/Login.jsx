import '../styles/Login.css';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export function Login({onLogin}) {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false);
    

    const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = { email, password, password_encrypted: password }; // enviar ambos por compatibilidad
      const res = await fetch('/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
        //body: JSON.stringify({ email, password_encrypted: password })
        //body: JSON.stringify({ email, password: password })
      })

      const text = await res.text()
      console.log('LOGIN status:', res.status, 'body:', text)
      const data = text ? JSON.parse(text) : {}

      //const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Error en login')
        //console.log(data)

      // ejemplo: backend puede devolver { token: '...', user: {...} } o { access_token: ... }
      const token = data.token ?? data.access_token ?? null
      const user = data.user ?? data

      if (token) localStorage.setItem('auth_token', token)
      if (user) localStorage.setItem('auth_user', JSON.stringify(user))

      // callback opcional para que la app padre maneje el login
      if (typeof onLogin === 'function') onLogin({ token, user })

      window.location.href = '/home'
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

    return (
      <>
      
        <div className="login-container">
          <Link to="/" className="back-button">
            <FaArrowLeft size={30} />
          </Link>
          <h1 style={{color: 'var(--text-principal)'}}>Login</h1>
          <form onSubmit={handleSubmit} className="login">
            <input
              type="email"
              placeholder="Email"
              value={email}
              name='email'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                name='password'
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
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
              <a href="/Register">No tienes cuenta?</a>
              <br />
              <a href="/forgot">Olvidaste la contraseña?</a>
            </div>
            <button className='submit' type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Login'}
            </button>
            {error && <p className="form-error">{error}</p>}
          </form>
        </div>
      <Footer />
      </>
    );
}