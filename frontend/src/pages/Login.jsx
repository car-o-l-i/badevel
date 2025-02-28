import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

const Login = () => {
    const [isLoginActive, setIsLoginActive] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Función para alternar entre login y registro
    const handleFormSwitch = () => {
        setIsLoginActive(!isLoginActive);
    };

    // Función para manejar el inicio de sesión
    const handleLogin = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:5000/login", { username, password });
            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
                navigate("/chat"); // Redirigir al chatbot
            } else {
                setError("Usuario o contraseña incorrectos.");
            }
        } catch (err) {
            console.error(err);
            setError("Error en el servidor.");
        }
    };

    return (
        <div className="form-structor">
            {/* Sección de registro */}
            <div className={`signup ${isLoginActive ? "slide-up" : ""}`}>
                <h2 className="form-title" onClick={handleFormSwitch}>
                    <span>or</span> Sign up
                </h2>
                <div className="form-holder">
                    <input type="text" className="input" placeholder="Nombre" />
                    <input type="email" className="input" placeholder="Email" />
                    <input type="password" className="input" placeholder="Contraseña" />
                </div>
                <button className="submit-btn">Registrarse</button>
            </div>

            {/* Sección de inicio de sesión */}
            <div className={`login ${isLoginActive ? "" : "slide-up"}`}>
                <div className="center">
                    <h2 className="form-title" onClick={handleFormSwitch}>
                        <span>or</span> Log in
                    </h2>
                    <div className="form-holder">
                        <input
                            type="text"
                            placeholder="Usuario"
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="submit-btn" onClick={handleLogin}>
                        Entrar
                    </button>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default Login;
