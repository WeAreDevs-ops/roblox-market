import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function ChatPage() {
  const db = getFirestore();
  const messagesRef = collection(db, 'messages');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('chatUsername') || `Guest${Math.floor(Math.random() * 1000)}`);
  const bottomRef = useRef(null);

  // Set guest ID if not exists
  useEffect(() => {
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', `guest_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, []);

  // Save username to localStorage when changed
  useEffect(() => {
    localStorage.setItem('chatUsername', username);
  }, [username]);

  // Real-time messages listener
  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isMe: doc.data().userId === localStorage.getItem('guestId')
      })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        displayName: username.trim(),
        userId: localStorage.getItem('guestId'),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username.trim())}&background=7DC387&color=fff`
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return 'now';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <h2>Marketplace Chat</h2>
        <p>Connected as: <strong>{username}</strong></p>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message-wrapper ${msg.isMe ? 'me' : 'other'}`}
            >
              {!msg.isMe && (
                <div className="message-header">
                  <img 
                    src={msg.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.displayName)}&background=ccc&color=fff`} 
                    alt={msg.displayName}
                    className="user-avatar"
                  />
                  <span className="username">{msg.displayName}</span>
                </div>
              )}
              <div className={`message ${msg.isMe ? 'me' : 'other'}`}>
                <p>{msg.text}</p>
                <span className="timestamp">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input Area */}
      <form onSubmit={handleSubmit} className="input-area">
        <div className="username-field">
          <label>Your name:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.targetValue)}
            className="username-input"
            maxLength={20}
          />
        </div>
        <div className="message-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
      </form>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 800px;
          margin: 0 auto;
          background: #f5f7fa;
        }
        
        .chat-header {
          padding: 15px;
          background: #7DC387;
          color: white;
          text-align: center;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .chat-header h2 {
          margin: 0;
          font-size: 1.4rem;
        }
        
        .chat-header p {
          margin: 5px 0 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }
        
        .messages-area {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          background: #f5f7fa;
        }
        
        .empty-chat {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #888;
        }
        
        .message-wrapper {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }
        
        .message-wrapper.me {
          align-items: flex-end;
        }
        
        .message-wrapper.other {
          align-items: flex-start;
        }
        
        .message-header {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          margin-left: 5px;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 8px;
          object-fit: cover;
        }
        
        .username {
          font-weight: 600;
          font-size: 0.85rem;
          color: #333;
        }
        
        .message {
          max-width: 80%;
          padding: 10px 15px;
          border-radius: 18px;
          position: relative;
          word-break: break-word;
        }
        
        .message.me {
          background: #7DC387;
          color: white;
          border-bottom-right-radius: 5px;
        }
        
        .message.other {
          background: white;
          color: #333;
          border-bottom-left-radius: 5px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .timestamp {
          display: block;
          font-size: 0.7rem;
          margin-top: 5px;
          text-align: right;
          opacity: 0.8;
        }
        
        .input-area {
          padding: 15px;
          border-top: 1px solid #e1e4e8;
          background: white;
        }
        
        .username-field {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .username-field label {
          font-size: 0.9rem;
          margin-right: 10px;
          color: #555;
        }
        
        .username-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 0.9rem;
        }
        
        .message-input-container {
          display: flex;
          gap: 10px;
        }
        
        .message-input {
          flex: 1;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 1rem;
          outline: none;
        }
        
        .send-button {
          padding: 0 20px;
          background: #7DC387;
          color: white;
          border: none;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .send-button:hover {
          background: #6bb077;
        }
        
        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
        }
        
