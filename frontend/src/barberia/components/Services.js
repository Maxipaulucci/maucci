import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { servicioService, negociosService, diasCanceladosService } from '../../services/api';
import { barberiaCache } from '../data/barberiaCache';
import { useEstablecimiento } from '../../context/EstablecimientoContext';
import './Services.css';

const Services = () => {
  const location = useLocation();
  const { codigo: establecimiento, to } = useEstablecimiento();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Al llegar desde el footer (state.filter): aplicar filtro y scroll al inicio
  useEffect(() => {
    const state = location.state;
    if (state?.filter) {
      setSelectedCategory(state.filter);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [location.state]);

  // Cargar servicios: mostrar caché al instante si existe, luego actualizar en segundo plano
  useEffect(() => {
    const cachedRaw = barberiaCache.getServicios(establecimiento);
    const cached = cachedRaw && Array.isArray(cachedRaw) ? convertirServicioABackend(cachedRaw) : [];
    if (cached.length > 0) {
      setServices(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    const cargarServicios = async () => {
      try {
        const response = await servicioService.obtenerServicios(establecimiento);
        const serviciosData = response.data || response;
        barberiaCache.setServicios(establecimiento, serviciosData);
        const serviciosConvertidos = convertirServicioABackend(serviciosData);
        setServices(serviciosConvertidos);
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        if (cached.length === 0) setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    cargarServicios();
  }, [establecimiento]);

  // Prefetch en segundo plano: días abiertos y días cancelados para que Reservar cargue al instante
  useEffect(() => {
    if (!establecimiento) return;
    const prefetchConfigReserva = async () => {
      try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaDesde = hoy.toISOString().split('T')[0];
        const [negocioResponse, diasCanceladosResponse] = await Promise.all([
          negociosService.obtenerNegocio(establecimiento),
          diasCanceladosService.obtenerDiasCancelados(establecimiento, fechaDesde).catch(() => ({ data: [] }))
        ]);
        const negocio = negocioResponse?.data ?? negocioResponse;
        const diasCanceladosData = diasCanceladosResponse?.data ?? diasCanceladosResponse ?? [];
        if (negocio) barberiaCache.setNegocio(establecimiento, negocio);
        if (Array.isArray(diasCanceladosData)) barberiaCache.setDiasCancelados(establecimiento, diasCanceladosData);
      } catch (err) {
        console.error('Prefetch config reserva (Servicios):', err);
      }
    };
    prefetchConfigReserva();
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
            <Link
              key={service.id}
              to={`${to('reservar')}?service=${service.id}`}
              className="service-card service-card-link"
            >
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
                <span className="btn btn-primary service-btn">
                  Reservar
                  <FaArrowRight className="btn-icon" />
                </span>
              </div>
            </Link>
          ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;


