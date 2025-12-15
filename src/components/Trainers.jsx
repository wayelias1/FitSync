import React, { useState, useEffect } from 'react';
import '../styles/ClassSchedule.css';

export function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trainer');
      
      if (!response.ok) {
        throw new Error('Error al cargar los entrenadores');
      }
      
      const data = await response.json();
      setTrainers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  if (loading) {
    return (
      <div className="class-schedule">
        <h2>Entrenadores</h2>
        <div className="schedule-list">
          <div className="schedule-item">
            <div className="item-name">Cargando entrenadores...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-schedule">
        <h2>Lista de Entrenadores</h2>
        <div className="schedule-list">
          <div className="schedule-item">
            <div className="item-name">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="class-schedule">
      <h2>Lista de Entrenadores</h2>
      <div className="schedule-list">
        <button onClick={fetchTrainers}>Reintentar</button>
        {trainers.length > 0 ? (
          trainers.map((trainer) => (
            <div key={trainer.id} className="schedule-item trainer-item">
              <div className="trainer-name">
                <strong>{trainer.name} {trainer.last_name}</strong>
              </div>
              <div className="trainer-email">
                {trainer.email}
              </div>
              <div className="trainer-phone">
                {trainer.number}
              </div>
            </div>
          ))
        ) : (
          <div className="schedule-item">
            <div className="item-name">No se encontraron entrenadores</div>
          </div>
        )}
      </div>
    </div>
  );
}