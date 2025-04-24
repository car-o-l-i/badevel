import { Link, useLocation } from "react-router-dom";
import { Home, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import PropTypes from "prop-types";

function Sidebar({ darkMode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isChatbotPage = location.pathname === "/chatbot";

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <aside
      className={`d-flex flex-column justify-content-between p-3 sidebar ${collapsed ? "collapsed" : ""}`}
      style={{
        width: collapsed ? "80px" : "250px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: darkMode ? "#1e1e2f" : "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(10px)",
        boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
        transition: "width 0.3s ease"
      }}
    >
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          {!collapsed && (
            <h3 className="fw-bold" style={{ color: darkMode ? "#ffffff" : "#1e1e2f" }}>
              🌐 Badevel
            </h3>
          )}
          <button
            className="btn btn-sm btn-outline-light"
            onClick={toggleCollapse}
            style={{ border: "none", background: "transparent", color: "inherit" }}
            title={collapsed ? "Ouvrir" : "Fermer"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* 🔄 Chatbot mode: historial estilo ChatGPT */}
        {isChatbotPage ? (
          <ul className="nav flex-column mt-3">
            {!collapsed && (
              <>
                <li className="nav-item mb-3">
                  <button className="btn btn-outline-light w-100 text-start">
                    + Nouveau chat
                  </button>
                </li>
                {/* Aquí se podrán agregar dinámicamente los historiales reales */}
              </>
            )}
          </ul>
        ) : (
          // 🔄 Navegación normal
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link
                to="/manage-devices"
                className={`nav-link d-flex align-items-center gap-2 ${
                  location.pathname === "/manage-devices" ? "active text-primary" : "text-white"
                }`}
              >
                <Home size={20} /> {!collapsed && "Dispositivos"}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/configuracion"
                className={`nav-link d-flex align-items-center gap-2 ${
                  location.pathname === "/configuracion" ? "active text-primary" : "text-white"
                }`}
              >
                <Settings size={20} /> {!collapsed && "Configuración"}
              </Link>
            </li>
          </ul>
        )}
      </div>

      {!collapsed && (
        <div className="text-center small text-muted">
          <p>&copy; 2025 Badevel</p>
        </div>
      )}
    </aside>
  );
}

Sidebar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default Sidebar;
