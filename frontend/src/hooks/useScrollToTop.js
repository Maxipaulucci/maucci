import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Hook para hacer scroll suave al top cuando cambia la ruta
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
};

// Función utilitaria para scroll suave
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};


