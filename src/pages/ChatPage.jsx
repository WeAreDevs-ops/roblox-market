import React, { useState, useEffect, useRef } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import Picker from 'emoji-picker-react'; // Emoji picker library (install it if needed)

const BANNED_WORDS = [
  //... (Same as before)
];

export default function ChatPage() {
  const db = getFirestore();
  const messagesRef = collection(db, 'public_messages');
  const typingRef = collection(db, 'typing_indicators');
  const onlineRef = collection(db, 'online_users');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tempUsername, setTempUsername] = useState(
    localStorage.getItem('chatUsername') || `Guest${Math.floor(Math.random() * 1000)}`
  );
  const [username, setUsername] = useState(localStorage.getItem('chatUsername') || '');
  const [isUsernameLocked, setIsUsernameLocked] = useState(!!localStorage.getItem('chatUsername'));
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageRefs = useRef({});

  useEffect(() => {
    //... (Same setup for username and online user tracking)
  }, []);

  useEffect(() => {
    //... (Same chat message snapshot handling)
  }, []);

  useEffect(() => {
    //... (Same typing indicator handling)
  }, []);

  useEffect(() => {
    //... (Same online user handling)
  }, []);

  const containsBannedWords = (text) => {
    //... (Same function)
  };

  const sendMessage = async (e) => {
    //... (Same logic, updated to handle emoji)
  };

  const handleInputChange = async (e) => {
    //... (Same logic)
  };

  const formatTime = (timestamp) => {
    //... (Same function)
  };

  const saveUsername = () => {
    //... (Same function)
  };

  const cancelReply = () => setReplyingTo(null);
  const getOriginalMessage = (replyToId) => messages.find(msg => msg.id === replyToId);

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f7fa' }}>
      <div style={{ backgroundColor: '#7DC387', color: 'white', padding: '15px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>Marketplace Chat</h1>
        <p style={{ margin: '5px 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
          Logged in as: <strong>{username}</strong> | Online: {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'}
        </p>
      </div>

      {replyingTo && (
        <div style={{ padding: '10px', backgroundColor: '#e4f0e4', borderBottom: '1px solid #ccc', textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>
            Replying to {replyingTo.displayName}: "{replyingTo.text}"
          </span>
          <button onClick={cancelReply} style={{ marginLeft: '10px', color: '#7DC387', cursor: 'pointer', background: 'none', border: 'none' }}>
            Cancel
          </button>
        </div>
      )}

      {typingUsers.length > 0 && (
        <div style={{ padding: '8px 15px', fontStyle: 'italic', color: '#666', backgroundColor: '#f0f0f0' }}>
          {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: 'linear-gradient(180deg, #f5f7fa 0%, #eef2f5 100%)' }}>
        {messages.map((msg) => {
          const originalMessage = msg.replyTo ? getOriginalMessage(msg.replyTo) : null;
          return (
            <div
              key={msg.id}
              ref={el => messageRefs.current[msg.id] = el}
              style={{
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.isMe ? 'flex-end' : 'flex-start',
                position: 'relative'
              }}
            >
              {msg.replyTo && originalMessage && (
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>
                  replied to <strong>{originalMessage.displayName}</strong>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-end', maxWidth: '80%' }}>
                {!msg.isMe && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundImage: `url(${msg.photoURL})`,
                    backgroundSize: 'cover',
                    marginRight: '10px'
                  }} />
                )}
                <div style={{
                  backgroundColor: msg.isMe ? '#7DC387' : 'white',
                  color: msg.isMe ? 'white' : '#333',
                  padding: '10px 15px',
                  borderRadius: '15px',
                  borderBottomRightRadius: msg.isMe ? '5px' : '15px',
                  borderBottomLeftRadius: msg.isMe ? '15px' : '5px',
                  position: 'relative'
                }}>
                  {msg.replyTo && originalMessage && (
                    <div
                      onClick={() => {
                        const target = messageRefs.current[msg.replyTo];
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          target.style.backgroundColor = '#ffffcc';
                          setTimeout(() => { target.style.backgroundColor = ''; }, 1000);
                        }
                      }}
                      style={{
                        backgroundColor: '#f2f2f2',
                        borderLeft: '3px solid #7DC387',
                        padding: '6px 8px',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#333',
                        cursor: 'pointer'
                      }}
                    >
                      <strong>{originalMessage.displayName}:</strong> {originalMessage.text}
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>
              </div>

              <div style={{ marginTop: '5px', marginLeft: msg.isMe ? '0' : '42px', fontSize: '0.75rem', color: msg.isMe ? '#7DC387' : '#666' }}>
                {!msg.isMe && <strong>{msg.displayName}</strong>} {formatTime(msg.createdAt)} &nbsp;|&nbsp;
                <button
                  onClick={() => setReplyingTo(msg)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: 0
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Username Input Area (only shown when not locked) */}
      {!isUsernameLocked && (
        <div style={{ padding: '10px', backgroundColor: '#fff', borderTop: '1px solid #ddd' }}>
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Enter your username"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              marginRight: '10px'
            }}
          />
          <button
            onClick={saveUsername}
            style={{
              padding: '10px 15px',
              backgroundColor: '#7DC387',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* Chat Input */}
      <form onSubmit={sendMessage} style={{ backgroundColor: 'white', borderTop: '1px solid #e1e4e8', padding: '15px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '12px 15px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '1rem'
            }}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(prev => !prev)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            😊
          </button>
          <button
            type="submit"
            disabled={!newMessage.trim() || !isUsernameLocked}
            style={{
              padding: '0 20px',
              backgroundColor: isUsernameLocked ? '#7DC387' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontWeight: '600',
              cursor: isUsernameLocked ? 'pointer' : 'not-allowed'
            }}
          >
            Send
          </button>
        </div>
        {showEmojiPicker && <Picker onEmojiClick={addEmoji} />}
      </form>
    </div>
  );
                  }
        
