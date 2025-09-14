import React, { useState } from "react";

const DebugSupaChatbot = ({ chatbotId, apiBase }) => {
  console.log("DebugSupaChatbot component function called with:", { chatbotId, apiBase });
  
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "bot",
      text: "Hello! This is a debug greeting message.",
    },
  ]);

  console.log("DebugSupaChatbot rendering with chatHistory:", chatHistory);

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid green', 
      margin: '20px',
      backgroundColor: 'lightgreen'
    }}>
      <h2>Debug SupaChatbot</h2>
      <p>Chatbot ID: {chatbotId}</p>
      <p>API Base: {apiBase}</p>
      <div>
        <h3>Chat History ({chatHistory.length} messages):</h3>
        {chatHistory.map((msg, idx) => (
          <div key={idx} style={{ 
            padding: '10px', 
            margin: '5px', 
            backgroundColor: msg.sender === 'bot' ? 'lightblue' : 'lightyellow',
            border: '1px solid black'
          }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugSupaChatbot;
