import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Verifica si el usuario está autenticado

  const handleLogout = () => {
    localStorage.removeItem("token"); // Elimina el token de sesión
    navigate("/login"); // Redirige al login
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed">
      <h2 className="text-2xl font-bold text-center py-5">Badevel</h2>
      <nav className="flex flex-col space-y-4 p-4">
        {token ? (
          <>
            <Link to="/" className="px-4 py-2 hover:bg-gray-700 rounded">
              🏠 Dashboard
            </Link>
            <Link to="/gestion" className="px-4 py-2 hover:bg-gray-700 rounded">
              🛠 Gestión de Dispositivos
            </Link>
            <Link to="/grafo" className="px-4 py-2 hover:bg-gray-700 rounded">
              🕸 Visualización del Grafo
            </Link>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded mt-4">
              🚪 Cerrar Sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="px-4 py-2 hover:bg-gray-700 rounded">
            🔑 Iniciar Sesión
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
