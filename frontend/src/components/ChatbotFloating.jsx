import { useState } from "react";
import { MessageSquareText, X } from "lucide-react";

function ChatbotFloating() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleToggle = () => {
    if (visible) {
      setClosing(true);
      setTimeout(() => {
        setClosing(false);
        setVisible(false);
      }, 300); // duración igual a la del CSS
    } else {
      setVisible(true);
    }
  };

  return (
    <>
      {/* Botón flotante con icono de conversación */}
      <button
        className="chatbot-toggle"
        onClick={handleToggle}
        title={visible ? "Fermer le chatbot" : "Ouvrir le chatbot"}
      >
        {visible ? (
          <X strokeWidth={2.5} color="white" />
        ) : (
          <MessageSquareText strokeWidth={2.5} color="white" />
        )}
      </button>

      {/* Ventana flotante del chatbot */}
      {visible && (
        <div className={`chatbot-container ${closing ? "closing" : ""}`}>
          <div className="chatbot-header">
            <h5 className="m-0">Assistant Badevel</h5>
            <button onClick={handleToggle} className="btn-close btn-close-white" />
          </div>
          <div className="chatbot-body">
            <p>💬 Ici s&apos;affichera la conversation avec le chatbot...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotFloating;
