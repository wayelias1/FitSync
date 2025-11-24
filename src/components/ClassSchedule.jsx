import React from 'react';
import '../styles/ClassSchedule.css';

export function ClassSchedule() {
  // Static class data
  const schedule = [
    { time: '8:00 AM', name: 'Spinning', available: true },
    { time: '9:00 AM', name: 'HIIT', available: false },
    { time: '10:00 AM', name: 'Yoga', available: true },
    { time: '5:00 PM', name: 'Crossfit', available: true },
    { time: '6:00 PM', name: 'Zumba', available: false },
  ];

  return (
    <div className="class-schedule">
      <h2>Horario de Clases de Hoy</h2>
      <div className="schedule-list">
        {schedule.map((item, index) => (
          <div key={index} className="schedule-item">
            <div className="item-time">{item.time}</div>
            <div className="item-name">{item.name}</div>
            <button className={`item-book ${item.available ? 'available' : 'full'}`}>
              {item.available ? 'Reservar' : 'Completo'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
