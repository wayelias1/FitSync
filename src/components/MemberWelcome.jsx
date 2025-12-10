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


  // Obtener el id_rol del usuario (1=user, 2=cliente, 3=admin, 4=trainer)
  const idRol = usuario?.id_rol ? Number(usuario.id_rol) : 1;
  const esCliente = idRol === 2;

  useEffect(() => {
    // Solo calcular fechas si el usuario es cliente (id_rol = 2)
    if (esCliente) {
      const hoy = new Date();
      setFechaActual(hoy);

      const diffMs = fechaRenovacion - hoy;
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      setDiasRestantes(diffDias);
    }
  }, [fechaRenovacion, esCliente]);

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
        {esCliente ? (
          // Usuario con id_rol = 2 (cliente): mostrar temporizador y permitir renovación
          <>
            <div className="renewal-info">
              <p className="renewal-date">Renovación: {fechaRenovacion.toLocaleDateString()}</p>
              <p className="renewal-days">{diasRestantes} días restantes</p>
            </div>
            <button className='btn-renovar' onClick={handleRenovar}>
              Renovar Ahora
            </button>
          </>
        ) : (
          // Usuario con id_rol = 1 (user): mostrar mensaje de upgrade
          <>
            <div className="renewal-info">
              <p className="renewal-date" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
                Membresía no activa
              </p>
              <p className="renewal-days" style={{ fontSize: '14px' }}>
                Activa tu membresía para acceder a todas las funcionalidades
              </p>
            </div>
            <button className='btn-renovar' onClick={handleRenovar}>
              Activar Membresía
            </button>
          </>
        )}
      </div>
    </section>
  );
}