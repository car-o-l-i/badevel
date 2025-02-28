import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Verifica si hay sesión activa
  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
