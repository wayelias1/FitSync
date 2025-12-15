import React, { useState, useEffect } from 'react';
import '../styles/ClassSchedule.css';

export function Nutritionists() {
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNutritionists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nutritionist');
      
      if (!response.ok) {
        throw new Error('Error al cargar los nutricionistas');
      }
      
      const data = await response.json();
      setNutritionists(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching nutritionists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionists();
  }, []);

  if (loading) {
    return (
      <div className="class-schedule">
        <h2>Nutricionistas</h2>
        <div className="schedule-list">
          <div className="schedule-item">
            <div className="item-name">Cargando nutricionistas...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-schedule">
        <h2>Lista de Nutricionistas</h2>
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
      <h2>Lista de Nutricionistas</h2>
      <div className="schedule-list trainers-list">
        <button onClick={fetchNutritionists}>Reintentar</button>
        {nutritionists.length > 0 ? (
          nutritionists.map((nutritionist) => (
            <div key={nutritionist.id} className="schedule-item trainer-item">
              <div className="trainer-column name-column">
                <strong>{nutritionist.name} {nutritionist.last_name}</strong>
              </div>
              <div className="trainer-column email-column">
                {nutritionist.email}
              </div>
              <div className="trainer-column phone-column">
                {nutritionist.number}
              </div>
            </div>
          ))
        ) : (
          <div className="schedule-item">
            <div className="item-name">No se encontraron nutricionistas</div>
          </div>
        )}
      </div>
    </div>
  );
}