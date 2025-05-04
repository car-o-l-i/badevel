// Mock para @react-oauth/google
import React from 'react';

// Componente ficticio que reemplaza GoogleOAuthProvider
export const GoogleOAuthProvider = ({ children }) => {
  return <>{children}</>;
};

// Componente ficticio que reemplaza GoogleLogin
export const GoogleLogin = () => {
  return <button className="btn btn-primary w-100">Login con Google (desactivado)</button>;
};

// Exportaciones adicionales
export default {
  GoogleOAuthProvider,
  GoogleLogin
}; 