import '../styles/Login.css';
import { useState } from 'react';
import { useEffect } from 'react';

export function Login({onLogin}) {
    useEffect(() => {
        fetch('/login') // ruta enpoint login, same example for others components with flask
          .then(res => res.json())
          .then(data => console.log(data))
          .catch(err => console.error(err))
    
      }, [])  
  

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password_encrypted: password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error en login')

      // ejemplo: backend puede devolver { token: '...', user: {...} } o { access_token: ... }
      const token = data.token ?? data.access_token ?? null
      const user = data.user ?? data

      if (token) localStorage.setItem('auth_token', token)
      if (user) localStorage.setItem('auth_user', JSON.stringify(user))

      // callback opcional para que la app padre maneje el login
      if (typeof onLogin === 'function') onLogin({ token, user })

      // redirigir tras login (ajusta según tu routing)
      window.location.href = '/'
    } catch (err) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

    return (
        <div className="login-container">
          <h1>Login</h1>
          <form onSubmit={handleSubmit} className="login">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div>
              <a href="/register">No tienes cuenta?</a>
              <br />
              <a href="/forgot">Olvidaste la contraseña?</a>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Login'}
            </button>
            {error && <p className="form-error">{error}</p>}
          </form>
        </div>
    );
}