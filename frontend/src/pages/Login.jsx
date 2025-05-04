import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/login.css";

import bg1 from "../assets/picture1.png";
import bg2 from "../assets/picture2.png";
import bg3 from "../assets/picture3.png";
import bg4 from "../assets/picture4.png";

const images = [bg1, bg2, bg3, bg4];

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex((prev) => (prev + 1) % images.length);
    }, 6000); // every 6 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        onLogin(data.role);
        navigate(data.role === "admin" ? "/manage-devices" : "/chatbot");
      } else {
        setError("Nom d'utilisateur ou mot de passe incorrect.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur du serveur.");
    }
  };

  return (
    <div
      className="login-wrapper"
      style={{
        backgroundImage: `url(${images[backgroundIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className={`login-box transition-box ${isLogin ? "fade-in" : "slide-in"}`}
        style={{
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderRadius: "12px",
          padding: "2rem 3rem",
          width: "400px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
        }}
      >
        <h2 className="text-center mb-4" style={{ fontWeight: 600 }}>
          {isLogin ? "Se connecter" : "Créer un compte"}
        </h2>

        {isLogin ? (
          <>
            <div className="form-group mb-3">
            <label>Nom d&apos;utilisateur</label>

              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex. admin"
              />
            </div>

            <div className="form-group mb-4">
              <label>Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ex. admin_password"
              />
            </div>

            <button onClick={handleLogin} className="btn btn-primary w-100 mb-3">
              Connexion
            </button>
          </>
        ) : (
          <>
            <div className="form-group mb-3">
              <label>Nom</label>
              <input
                type="text"
                className="form-control"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                placeholder="Votre nom complet"
              />
            </div>

            <div className="form-group mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group mb-4">
              <label>Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                placeholder="Créer un mot de passe"
              />
            </div>

            <button className="btn btn-success w-100 mb-3">S&apos;inscrire</button>
          </>
        )}

        {error && <div className="alert alert-danger text-center p-2">{error}</div>}

        <div className="text-center my-3">
          <span className="text-white-50">
            {isLogin ? "Pas de compte ?" : "Déjà inscrit ?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="btn btn-link text-white"
              style={{ textDecoration: "underline", padding: 0 }}
            >
              {isLogin ? "Créer un compte" : "Se connecter"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
