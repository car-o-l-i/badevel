// src/context/useUser.jsx
import { useContext } from 'react';
import UserContext from './UserContext'; // Importamos el contexto

// Hook para acceder al contexto del usuario en cualquier parte de la aplicación
const useUser = () => {
  const context = useContext(UserContext); // Usamos useContext para acceder al contexto
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context; // Devuelve el contexto
};

export default useUser;
