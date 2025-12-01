import React from 'react';
import '../styles/MemberWelcome.css';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export function MemberWelcome() {
  const rawUser = localStorage.getItem('auth_user');
  const usuario = rawUser ? JSON.parse(rawUser) : null;

  const [fechaActual, setFechaActual] = useState(new Date());
  const [fechaRenovacion, setFechaRenovacion] = useState(
    new Date("2025-12-31")
  );
  const [diasRestantes, setDiasRestantes] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const hoy = new Date();
    setFechaActual(hoy);

    const diffMs = fechaRenovacion - hoy;
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    setDiasRestantes(diffDias);
  }, [fechaRenovacion]);

  const handleRenovar = () => {
    navigate("/payment");
  };

  return (
    <section className="member-welcome">
      <div className="member-content">
        <h1>¡Bienvenido de vuelta, {usuario?.name}! <br />Continúa tu progreso</h1>

        <p className='text'>Nos alegra mucho que hayas regresado.
           Queremos que sepas que seguimos construyendo la pagina para mejorar y hacer que tu experiencia sea cada vez mejor. ¡Estamos en constante evolución!</p>

        
      </div>

      {/* Sección de renovación en esquina inferior izquierda */}
      <div className="renewal-card">
        <h3>Tu Membresía</h3>
        <div className="renewal-info">
          <p className="renewal-date">Renovación: {fechaRenovacion.toLocaleDateString()}</p>
          <p className="renewal-days">{diasRestantes} días restantes</p>
        </div>
        <button className='btn-renovar' onClick={handleRenovar}>
          Renovar Ahora
        </button>
      </div>
    </section>
  );
}