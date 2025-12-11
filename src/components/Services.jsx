import { FaDumbbell, FaMugHot, FaShower, FaHeartbeat } from 'react-icons/fa';
import '../styles/Services.css'

// Componente para cada Tarjeta de Servicio
const ServiceCard = ({ IconComponent, title, description }) => (
  <div className="service-card">
    <div className="service-icon">
      <IconComponent />
    </div>
    <h3 className="service-title">{title}</h3>
    <p className="service-description">{description}</p>
  </div>
);

// Componente Principal de la Sección de Servicios
export function Services() {
  const servicesData = [
    {
      id: 1,
      IconComponent: FaDumbbell,
      title: 'Equipo de calidad',
      description: 'Te ofrecemos equipos de última generación, de marcas líderes y con el mantenimiento más riguroso.'
    },
    {
      id: 2,
      IconComponent: FaMugHot,
      title: 'Nutrición saludable',
      description: 'Nos encorajamos a que adoptes una nutrición saludable como tu aliada principal.'
    },
    {
      id: 3,
      IconComponent: FaShower,
      title: 'Servicio de baño',
      description: 'Sabemos que tu tiempo es oro; termina tu día con la comodidad y privacidad de nuestros baños de alta calidad.'
    },
    {
      id: 4,
      IconComponent: FaHeartbeat,
      title: 'Bienestar único para ti',
      description: 'Diseño de bienestar personalizado para ti, desde el inicio hasta el final. Pensando en ti todo el tiempo.'
    },
  ];

  return (
    <section className="Services"> {/* Clase principal: "Services" */}
      <div className="Services-content"> {/* Contenedor de contenido: "Services-content" */}

        {/* Encabezado */}
        <div className="services-header">
          <p className="services-subtitle">Desafíos</p>
          <h2 className="services-main-title">SUPERA TUS LÍMITES</h2>
        </div>

        {/* Contenedor de las Tarjetas */}
        <div className="services-cards-grid">
          {servicesData.map((service) => (
            <ServiceCard
              key={service.id}
              IconComponent={service.IconComponent}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>

      </div>
    </section>
  );
}