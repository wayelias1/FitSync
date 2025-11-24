import React from 'react';
import '../styles/MemberGoals.css';

export function MemberGoals() {
  // Static goals data
  const goals = [
    { name: 'Correr 5km', progress: 60 },
    { name: 'Levantar 100kg en peso muerto', progress: 85 },
    { name: 'Asistir a 10 clases de yoga', progress: 40 },
  ];

  return (
    <div className="member-goals">
      <h2>Mis Metas</h2>
      <div className="goals-list">
        {goals.map((goal, index) => (
          <div key={index} className="goal-item">
            <div className="goal-name">{goal.name}</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            <div className="progress-label">{goal.progress}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
