 
import  { useState } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() === "") return;

    setMessages([...messages, { text: input, sender: "user" }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100">
      <div className="w-3/4 h-3/4 bg-white shadow-md rounded-lg p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <span className="bg-blue-500 text-white p-2 rounded">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="w-3/4 flex mt-4">
        <input
          type="text"
          placeholder="Write you're  question ..."
          className="border p-2 flex-grow rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 ml-2 rounded" onClick={sendMessage}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
