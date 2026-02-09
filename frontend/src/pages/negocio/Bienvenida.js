import React from 'react';
import './NegocioPage.css';
import './Bienvenida.css';

const Bienvenida = () => {
  return (
    <div className="negocio-page">
      <div className="bienvenida-container">
        <div className="bienvenida-content">
          <h1 className="bienvenida-title">
            Panel de negocio
          </h1>
          <p className="bienvenida-subtitle">
            Desde aquí podrás gestionar tu negocio
          </p>
        </div>
      </div>
    </div>
  );
};

export default Bienvenida;

