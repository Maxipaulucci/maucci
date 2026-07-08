import React, { createContext, useContext, useState } from 'react';

const ServicesModalContext = createContext(null);

export const ServicesModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openServicesModal = () => setIsOpen(true);
  const closeServicesModal = () => setIsOpen(false);
  return (
    <ServicesModalContext.Provider value={{ isOpen, openServicesModal, closeServicesModal }}>
      {children}
    </ServicesModalContext.Provider>
  );
};

export const useServicesModal = () => {
  const ctx = useContext(ServicesModalContext);
  if (!ctx) return { isOpen: false, openServicesModal: () => {}, closeServicesModal: () => {} };
  return ctx;
};
