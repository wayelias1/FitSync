// src/components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setIsValid(false);
      return;
    }

    fetch('http://localhost:5000/api/token/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ access_token: token })
    })
      .then(res => {
        if (res.ok) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      })
      .catch((err) => {
        console.error("Error verificando token:", err);
        setIsValid(false);
      });
  }, []);

  if (isValid === null) return; //<div className="loading-screen">Verificando sesión...</div>

  if (!isValid) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return <Navigate to="/login" replace />;
  }

  return children;
}