import { useState, useEffect } from "react";
import GraphVisualization from "./GraphVisualization";
import "../styles/Chatbot.css";
import { Send } from "lucide-react";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    document.body.style.backgroundImage = `url("/city.png")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    return () => (document.body.style.backgroundImage = "none");
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");
  };

  return (
    <div className="chatbot-layout">
      <div className="chatbot-wrapper">
        {/* Columna central: conversación */}
        <div className="chat-column">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-bubble ${msg.from === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Posez votre question ici..."
            />
            <button onClick={handleSend}>
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Columna derecha: grafo + preguntas */}
        <div className="chatbot-right-panel">
          <div className="graph-container">
            <GraphVisualization />
          </div>

          <div className="faq-container">
            <h6 className="text-muted mb-2">Questions fréquentes</h6>
            <button className="btn btn-sm btn-outline-secondary mb-2">
              ¿Cuántos sensores hay?
            </button>
            <button className="btn btn-sm btn-outline-secondary mb-2">
              ¿Dónde están los sensores de gas?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
