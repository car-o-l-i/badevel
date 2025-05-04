// src/context/UserContext.jsx
import { createContext, useState } from 'react';
import PropTypes from 'prop-types';  // Importamos PropTypes

// Crear el contexto del usuario
const UserContext = createContext();

// El proveedor del contexto que envolverá toda la aplicación
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ role: 'admin' }); // Valor inicial del usuario

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}  {/* Renderiza los hijos */}
    </UserContext.Provider>
  );
};

// Validar la propiedad 'children' con PropTypes
UserProvider.propTypes = {
  children: PropTypes.node.isRequired,  // Validamos que 'children' sea cualquier tipo de nodo (texto, componente, etc.)
};

export default UserContext;
