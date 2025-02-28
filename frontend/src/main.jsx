/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Chatbot from "./pages/Chatbot";
import Dashboard from "./pages/Dashboard";
import ManageDevices from "./pages/ManageDevices";
import GraphVisualization from "./pages/GraphVisualization"; 

const App = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/"; // Solo oculta el navbar en la página de login

  return (
    <div className="flex">
      {!hideNavbar && <Navbar />}
      <div className={hideNavbar ? "w-full p-8" : "ml-64 p-8 w-full"}>
        <Routes>
          <Route path="/" element={<ManageDevices />} />
          <Route path="/login" element={<Login />} />  {/* Ruta para el login */}
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gestion" element={<ManageDevices />} />
          <Route path="/grafo" element={<GraphVisualization />} />
        </Routes>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
