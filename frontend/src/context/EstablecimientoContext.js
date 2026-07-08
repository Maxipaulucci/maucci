import React, { createContext, useContext, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const EstablecimientoContext = createContext(null);

const LEGACY_BARBERIA_CODIGO = 'barberia_clasica';

export const EstablecimientoProvider = ({ children }) => {
  const { codigo } = useParams();
  const location = useLocation();

  const value = useMemo(() => {
    const establecimiento = (codigo || LEGACY_BARBERIA_CODIGO).toLowerCase();
    const basePath = location.pathname.startsWith('/barberia')
      ? '/barberia'
      : `/local/${establecimiento}`;

    const to = (subpath = '') => {
      if (!subpath) return basePath;
      const clean = subpath.startsWith('/') ? subpath.slice(1) : subpath;
      return `${basePath}/${clean}`;
    };

    return { codigo: establecimiento, basePath, to };
  }, [codigo, location.pathname]);

  return (
    <EstablecimientoContext.Provider value={value}>
      {children}
    </EstablecimientoContext.Provider>
  );
};

export const useEstablecimiento = () => {
  const context = useContext(EstablecimientoContext);
  const location = useLocation();

  if (context) return context;

  if (location.pathname.startsWith('/barberia')) {
    return {
      codigo: LEGACY_BARBERIA_CODIGO,
      basePath: '/barberia',
      to: (subpath = '') => {
        if (!subpath) return '/barberia';
        const clean = subpath.startsWith('/') ? subpath.slice(1) : subpath;
        return `/barberia/${clean}`;
      }
    };
  }

  return {
    codigo: LEGACY_BARBERIA_CODIGO,
    basePath: `/local/${LEGACY_BARBERIA_CODIGO}`,
    to: (subpath = '') => {
      if (!subpath) return `/local/${LEGACY_BARBERIA_CODIGO}`;
      const clean = subpath.startsWith('/') ? subpath.slice(1) : subpath;
      return `/local/${LEGACY_BARBERIA_CODIGO}/${clean}`;
    }
  };
};
