import React, { createContext, useContext, useState } from 'react';

const ContactModalContext = createContext(null);

export const ContactModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openContactModal = () => setIsOpen(true);
  const closeContactModal = () => setIsOpen(false);
  return (
    <ContactModalContext.Provider value={{ isOpen, openContactModal, closeContactModal }}>
      {children}
    </ContactModalContext.Provider>
  );
};

export const useContactModal = () => {
  const ctx = useContext(ContactModalContext);
  if (!ctx) return { isOpen: false, openContactModal: () => {}, closeContactModal: () => {} };
  return ctx;
};
