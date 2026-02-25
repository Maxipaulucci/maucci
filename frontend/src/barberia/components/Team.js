import React, { useState, useEffect } from 'react';
import { FaAward, FaStar, FaUserCircle } from 'react-icons/fa';
import { personalService } from '../../services/api';
import { barberiaCache } from '../data/barberiaCache';
import './Team.css';

const Team = () => {
  const establecimiento = 'barberia_clasica'; // Por ahora hardcodeado
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para convertir datos del backend al formato esperado
  const convertirPersonalABackend = (personalBackend) => {
    return personalBackend.map(p => ({
      id: p.idPersonal,
      name: p.nombre,
      role: p.rol,
      avatar: p.avatar || '/assets/img/establecimientos/barberia_ejemplo/personal/personal1.jpg',
      specialties: p.specialties || [],
      certificado: (p.tituloCertificado || '').trim() || null
    }));
  };

  // Cargar personal: mostrar caché al instante si existe, luego actualizar en segundo plano
  useEffect(() => {
    const cachedRaw = barberiaCache.getPersonal(establecimiento);
    const cached = cachedRaw && Array.isArray(cachedRaw) ? convertirPersonalABackend(cachedRaw) : [];
    if (cached.length > 0) {
      setTeam(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    const cargarPersonal = async () => {
      try {
        const response = await personalService.obtenerPersonal(establecimiento);
        const personalData = response.data || response;
        barberiaCache.setPersonal(establecimiento, personalData);
        const personalConvertido = convertirPersonalABackend(personalData);
        setTeam(personalConvertido);
      } catch (err) {
        console.error('Error al cargar personal:', err);
        if (cached.length === 0) setTeam([]);
      } finally {
        setIsLoading(false);
      }
    };

    cargarPersonal();
  }, [establecimiento]);

  return (
    <section className="team" id="equipo">
      <div className="container">
        <div className="section-header">
          <h2>Nuestro Equipo</h2>
          <p>Conoce a los profesionales que harán que te veas y te sientas increíble</p>
        </div>

        {isLoading ? (
          <div className="loading-message">Cargando equipo...</div>
        ) : team.length === 0 ? (
          <div className="loading-message">No hay miembros del equipo disponibles</div>
        ) : (
          <div className="team-grid">
            {team.map(member => (
            <div key={member.id} className="team-card">
              <div className="member-avatar">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="avatar-image"
                />
              </div>
              
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                
                <div className="member-specialties">
                  <h4>Especialidades:</h4>
                  <div className="specialties-list">
                    {member.specialties.map((specialty, index) => (
                      <span key={index} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {member.certificado && (
                <div className="member-footer">
                  <div className="experience-badge">
                    <FaAward className="badge-icon" />
                    <span>{member.certificado}</span>
                  </div>
                </div>
              )}
            </div>
            ))}
          </div>
        )}

        {/* Información adicional del equipo */}
        <div className="team-info">
          <div className="info-card">
            <h3>¿Por qué elegirnos?</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon info-icon-svg">
                  <FaAward aria-hidden />
                </div>
                <div className="info-content">
                  <h4>Profesionales Certificados</h4>
                  <p>Todos nuestros barberos están certificados y tienen años de experiencia</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon info-icon-svg">
                  <FaStar aria-hidden />
                </div>
                <div className="info-content">
                  <h4>Calidad Garantizada</h4>
                  <p>Nos comprometemos a brindarte el mejor servicio en cada visita</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon info-icon-svg">
                  <FaUserCircle aria-hidden />
                </div>
                <div className="info-content">
                  <h4>Atención Personalizada</h4>
                  <p>Cada cliente recibe un trato único y personalizado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;


