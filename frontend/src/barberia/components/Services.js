import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { servicioService } from '../../services/api';
import './Services.css';

const Services = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Determinar el establecimiento basado en la ruta
  const getEstablecimiento = () => {
    if (location.pathname.includes('/barberia')) {
      return 'barberia_clasica';
    }
    return 'barberia_clasica'; // Por defecto
  };

  const establecimiento = getEstablecimiento();

  // Función para convertir datos del backend al formato esperado
  const convertirServicioABackend = (serviciosBackend) => {
    return serviciosBackend.map(s => ({
      id: s.idServicio,
      name: s.nombre,
      category: s.categoria,
      duration: s.duracion,
      price: s.precio,
      description: s.descripcion
    }));
  };

  // Cargar servicios desde el backend
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setIsLoading(true);
        const response = await servicioService.obtenerServicios(establecimiento);
        const serviciosData = response.data || response;
        const serviciosConvertidos = convertirServicioABackend(serviciosData);
        setServices(serviciosConvertidos);
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarServicios();
  }, [establecimiento]);

  // Obtener categorías únicas
  const categories = ['Todos', ...new Set(services.map(service => service.category))];

  // Filtrar servicios por categoría
  const filteredServices = selectedCategory === 'Todos' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <section className="services" id="servicios">
      <div className="container">
        <div className="section-header">
          <h2>Nuestros Servicios</h2>
          <p>Ofrecemos una amplia gama de servicios profesionales para cuidar tu imagen</p>
        </div>

        {/* Filtros de categoría */}
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid de servicios */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Cargando servicios...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No hay servicios disponibles en este momento.</p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3 className="service-name">{service.name}</h3>
                <span className="service-category">{service.category}</span>
              </div>
              
              <div className="service-details">
                <div className="service-info">
                  <div className="service-duration">
                    <div className="info-icon-wrapper">
                      <img 
                        src="/assets/img/logos_genericos/reloj.png" 
                        alt="Duración" 
                        className="info-icon"
                      />
                    </div>
                    <span>{service.duration}</span>
                  </div>
                  <div className="service-price">
                    <div className="info-icon-wrapper">
                      <img 
                        src="/assets/img/logos_genericos/dinero.png" 
                        alt="Precio" 
                        className="info-icon"
                      />
                    </div>
                    <span>{service.price}</span>
                  </div>
                </div>
                
                <p className="service-description">{service.description}</p>
              </div>
              
              <div className="service-footer">
                <Link 
                  to={`/barberia/reservar?service=${service.id}`}
                  className="btn btn-primary service-btn"
                >
                  Reservar
                  <FaArrowRight className="btn-icon" />
                </Link>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;


