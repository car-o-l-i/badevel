import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import ManageDevices from "./pages/ManageDevices";
import Chatbot from "./pages/Chatbot";

import city from "./assets/city.png";
import cityDark from "./assets/cityDark.png";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole) setUserRole(savedRole);
  }, []);

  const handleLogin = (role) => {
    localStorage.setItem("role", role);
    setUserRole(role);
  };

  const isLoginPage = location.pathname === "/login";
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const backgroundImage = darkMode ? cityDark : city;

  return (
    <div className={darkMode ? "dark-mode app-wrapper" : "light-mode app-wrapper"}>
      <div
        className="background-image"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="background-overlay" />

      {/* Sidebar solo cuando el usuario está logueado y no está en login */}
{!isLoginPage && userRole && <Sidebar darkMode={darkMode} />}

      <div
        style={{
          marginLeft: !isLoginPage && userRole ? "250px" : "0",
          padding: !isLoginPage ? "20px" : "0",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          
          <Route
  path="/manage-devices"
  element={
    userRole === "admin"
      ? (
          <ManageDevices
            userRole={userRole}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        )
      : <Navigate to="/login" />
  }
/>






          <Route
            path="/chatbot"
            element={userRole === "user" ? <Chatbot /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={
              userRole
                ? userRole === "admin"
                  ? <Navigate to="/manage-devices" />
                  : <Navigate to="/chatbot" />
                : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </div>
  );
  
}

export default App;
