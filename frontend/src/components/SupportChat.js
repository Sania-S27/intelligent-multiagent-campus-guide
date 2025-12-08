import React, { useState, useRef, useEffect } from 'react';
import { postToSupportChat } from '../api';

// Browser Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const SupportChat = ({ onNavigateRequest, onViewEventsRequest }) => {
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : [
      { sender: 'bot', text: 'Hello! I can help with navigation, events, or general questions.' }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  // --- VOICE INPUT LOGIC ---
  const toggleListening = () => {
    if (!recognition) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  if (recognition) {
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-send with isVoiceInput = true
      handleSend(transcript, true); 
    };
    recognition.onend = () => setIsListening(false);
  }

  // --- TEXT-TO-SPEECH LOGIC ---
  const speak = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Modified handleSend to accept isVoiceInput flag
  const handleSend = async (textOverride = null, isVoiceInput = false) => {
    const messageText = textOverride || input;
    if (!messageText.trim()) return;

    const userMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await postToSupportChat(messageText);
      const { reply, action, action_data } = response.data;

      const botMessage = { 
        sender: 'bot', 
        text: reply,
        action: action,
        data: action_data
      };
      setMessages(prev => [...prev, botMessage]);
      
      // VVV THIS IS THE LOGIC CHANGE VVV
      // Only speak automatically if the user used their voice
      if (isVoiceInput) {
        speak(reply);
      }
      // ^^^ END CHANGE ^^^

    } catch (err) {
      console.error('Chat error', err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting.' }]);
    }
  };

  const clearChat = () => {
      if(window.confirm("Clear chat history?")) {
          localStorage.removeItem('chat_history');
          setMessages([{ sender: 'bot', text: 'Chat cleared. How can I help?' }]);
      }
  }

  return (
    <div className="chat-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px', marginBottom: '10px' }}>
        <h2 style={{ color: 'var(--gradient-end)', margin: 0, border: 'none' }}>AI Support</h2>
        <button onClick={clearChat} style={{background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.8rem'}}>Clear</button>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`} style={{position: 'relative'}}>
            
            {/* VVV ADD SPEAKER BUTTON FOR BOT MESSAGES VVV */}
            {msg.sender === 'bot' && (
              <button 
                onClick={() => speak(msg.text)}
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
                title="Read aloud"
              >
                🔊
              </button>
            )}
            {/* ^^^ END SPEAKER BUTTON ^^^ */}

            <p>{msg.text}</p>
            
            {msg.action === 'navigate' && (
              <button className="nav-button" style={{fontSize: '0.8rem', padding: '5px 10px', marginTop: '5px', width: 'auto',backgroundColor:'green'}} onClick={() => onNavigateRequest(msg.data.destination)}>
                📍 View Route
              </button>
            )}
            {msg.action === 'view_events' && (
              <button className="nav-button" style={{fontSize: '0.8rem', padding: '5px 10px', marginTop: '5px', width: 'auto',backgroundColor:'green'}} onClick={onViewEventsRequest}>
                📅 Go to Events
              </button>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <button onClick={toggleListening} style={{ background: isListening ? '#dc3545' : '#6c757d', border: 'none', borderRadius: '50%', width: '45px', height: '45px', marginRight: '10px', cursor: 'pointer', color: 'white', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Use Microphone">
          {isListening ? '⬛' : '🎙️'}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          // Typing Enter sends isVoiceInput = false
          onKeyPress={(e) => e.key === 'Enter' && handleSend(null, false)} 
          placeholder="Ask 'Route to Canteen'..."
        />
        
        {/* Clicking Send sends isVoiceInput = false */}
        <button onClick={() => handleSend(null, false)} style={{ background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)', border: 'none', borderRadius: '20px', padding: '10px 25px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
            Send
        </button>
      </div>
    </div>
  );
};

export default SupportChat;