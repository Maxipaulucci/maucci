import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [negocioNoEncontrado, setNegocioNoEncontrado] = useState(null);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedNegocioNoEncontrado = localStorage.getItem('negocioNoEncontrado');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('user');
      }
    }
    if (savedNegocioNoEncontrado) {
      try {
        setNegocioNoEncontrado(JSON.parse(savedNegocioNoEncontrado));
      } catch (error) {
        console.error('Error al cargar estado de negocio:', error);
        localStorage.removeItem('negocioNoEncontrado');
      }
    }
  }, []);

  // Función para iniciar sesión
  const login = (email, rol = null, nombreNegocio = null, isSuperAdmin = false) => {
    const userData = { email, rol, nombreNegocio, isSuperAdmin: !!isSuperAdmin };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Limpiar estado de negocio no encontrado al hacer login
    setNegocioNoEncontrado(null);
    localStorage.removeItem('negocioNoEncontrado');
  };

  // Función para establecer que el negocio no fue encontrado
  const setNegocioNoEncontradoState = (data) => {
    setNegocioNoEncontrado(data);
    localStorage.setItem('negocioNoEncontrado', JSON.stringify(data));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    setNegocioNoEncontrado(null);
    localStorage.removeItem('user');
    localStorage.removeItem('negocioNoEncontrado');
  };

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      negocioNoEncontrado,
      setNegocioNoEncontradoState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

