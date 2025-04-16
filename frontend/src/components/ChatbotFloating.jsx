import { useState } from "react";
import { Bot, X } from "lucide-react";


function ChatbotFloating() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante con icono de bot */}
      <button
        className="chatbot-toggle"
        onClick={() => setOpen(!open)}
        title={open ? "Fermer le chatbot" : "Ouvrir le chatbot"}
      >
        {open ? <X /> : <Bot />}
      </button>

      {/* Ventana flotante del chatbot */}
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h5 className="m-0">Assistant Badevel</h5>
            <button onClick={() => setOpen(false)} className="btn-close btn-close-white" />
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
