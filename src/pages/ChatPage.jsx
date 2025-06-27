import React, { useState, useEffect, useRef } from 'react';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

export default function ChatPage() {
  const db = getFirestore();
  const messagesRef = collection(db, 'public_messages');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState(
    localStorage.getItem('chatUsername') || `Guest${Math.floor(Math.random() * 1000)}`
  );
  const bottomRef = useRef(null);

  // Initialize user
  useEffect(() => {
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', `guest_${Math.random().toString(36).substr(2, 9)}`);
    }
    localStorage.setItem('chatUsername', username);
  }, [username]);

  // Load messages
  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isMe: doc.data().userId === localStorage.getItem('guestId')
      }));
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        displayName: username,
        userId: localStorage.getItem('guestId'),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f5f7fa'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#7DC387',
        color: 'white',
        padding: '15px',
        textAlign: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.4rem',
          fontWeight: 'bold'
        }}>Marketplace Chat</h1>
        <p style={{ 
          margin: '5px 0 0',
          fontSize: '0.9rem',
          opacity: 0.9
        }}>Logged in as: <strong>{username}</strong></p>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        background: 'linear-gradient(180deg, #f5f7fa 0%, #eef2f5 100%)'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#888'
          }}>
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{
                marginBottom: '15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                maxWidth: '80%'
              }}>
                {!msg.isMe && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#ddd',
                    backgroundImage: `url(${msg.photoURL})`,
                    backgroundSize: 'cover',
                    marginRight: '10px',
                    flexShrink: 0
                  }} />
                )}
                
                <div style={{
                  backgroundColor: msg.isMe ? '#7DC387' : 'white',
                  color: msg.isMe ? 'white' : '#333',
                  padding: '10px 15px',
                  borderRadius: '15px',
                  boxShadow: msg.isMe ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
                  borderBottomRightRadius: msg.isMe ? '5px' : '15px',
                  borderBottomLeftRadius: msg.isMe ? '15px' : '5px',
                  position: 'relative'
                }}>
                  <p style={{ 
                    margin: 0,
                    fontSize: '0.95rem'
                  }}>{msg.text}</p>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '5px',
                marginLeft: msg.isMe ? '0' : '42px'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: msg.isMe ? '#7DC387' : '#666'
                }}>
                  {!msg.isMe && (
                    <span style={{ 
                      fontWeight: '600',
                      marginRight: '5px'
                    }}>{msg.displayName}</span>
                  )}
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e1e4e8',
        padding: '15px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <label style={{
            fontSize: '0.9rem',
            color: '#555',
            marginRight: '10px'
          }}>Name:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '0.9rem',
              outline: 'none'
            }}
            maxLength={20}
          />
        </div>
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '12px 15px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              padding: '0 20px',
              backgroundColor: '#7DC387',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
              }
            
