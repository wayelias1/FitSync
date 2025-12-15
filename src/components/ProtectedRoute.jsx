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

    fetch('http://localhost:5000/api/process-payment', {
  method: 'HEAD',
  headers: { Authorization: `Bearer ${token}` }
})
      .then(res => {
        if (res.status === 200) setIsValid(true);
        else setIsValid(false);
      })
      .catch(() => setIsValid(false));
  }, []);

  if (isValid === null) return;
  if (!isValid) {
    localStorage.removeItem('auth_token');
    return <Navigate to="/login" replace />;
  }

  return children;
}