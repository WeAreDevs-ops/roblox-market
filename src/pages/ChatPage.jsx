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

const BANNED_WORDS = [
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'nigger', 
  'whore', 'slut', 'dick', 'pussy', 'cock', 'fag', 'retard',
  'sex', 'rape', 'porn', 'idiot', 'stupid', 'loser', 
  'bastard', 'dumb', 'fool', 'jerk', 'scum', 'creep', 
  'tramp', 'skank', 'pimp', 'freak', 'iyot', 'bobo', 'bbo', 'fuckyou',
  'fuck you', 'bold', 'putangina', 'puta', 'pota', 'p0ta', 'tangina', 'tanginamo',
  'wtf', 'what the fuck', 'yw', 'yawa', 'nudes', 'vcs', 'tanga', 'tsnga', 't4nga',
];

export default function ChatPage() {
  const db = getFirestore();
  const messagesRef = collection(db, 'public_messages');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tempUsername, setTempUsername] = useState(
    localStorage.getItem('chatUsername') || `Guest${Math.floor(Math.random() * 1000)}`
  );
  const [username, setUsername] = useState(localStorage.getItem('chatUsername') || '');
  const [isUsernameLocked, setIsUsernameLocked] = useState(!!localStorage.getItem('chatUsername'));
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', `guest_${Math.random().toString(36).substr(2, 9)}`);
    }
    if (!localStorage.getItem('chatUsername')) {
      setUsername(`Guest${Math.floor(Math.random() * 1000)}`);
      setTempUsername(`Guest${Math.floor(Math.random() * 1000)}`);
    }
  }, []);

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

  useEffect(() => {
    const typingRef = collection(db, 'typing_indicators');
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      const typingData = {};
      snapshot.forEach(doc => {
        typingData[doc.id] = doc.data();
      });
      const users = Object.values(typingData)
        .filter(user => user.userId !== localStorage.getItem('guestId'))
        .map(user => user.displayName);
      setTypingUsers(users);
    });
    return () => unsubscribe();
  }, []);

  const containsBannedWords = (text) => {
    return BANNED_WORDS.some(badWord => text.toLowerCase().includes(badWord));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (containsBannedWords(newMessage)) {
      alert("Your message contains blocked words. Please revise your message.");
      return;
    }

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        displayName: username,
        userId: localStorage.getItem('guestId'),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`,
        replyTo: replyingTo ? replyingTo.id : null,
        replyingTo:User  replyingTo ? replyingTo.displayName : null,
        replyingToText: replyingTo ? replyingTo.text : null
      });
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return 'now';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const saveUsername = () => {
    if (tempUsername.trim() && !isUsernameLocked) {
      setUsername(tempUsername);
      localStorage.setItem('chatUsername', tempUsername);
      setIsUsernameLocked(true);
    }
  };

  const handleReplyClick = (msg) => {
    if (!msg.isMe) {
      setReplyingTo(msg);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const getOriginalMessage = (replyToId) => {
    return messages.find(msg => msg.id === replyToId);
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

      {/* Replying to Message */}
      {replyingTo && (
        <div style={{
          padding: '10px',
          backgroundColor: '#e4f0e4',
          borderBottom: '1px solid #ccc',
          textAlign: 'center'
        }}>
          <span style={{ fontWeight: 'bold' }}>
            Replying to {replyingTo.displayName}: "{replyingTo.text}"
          </span>
          <button onClick={cancelReply} style={{
            marginLeft: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#7DC387',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
        </div>
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div style={{
          padding: '8px 15px',
          fontStyle: 'italic',
          color: '#666',
          backgroundColor: '#f0f0f0',
          borderBottom: '1px solid #ddd'
        }}>
          {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
        </div>
      )}

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
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const originalMessage = msg.replyTo ? getOriginalMessage(msg.replyTo) : null;
            
            return (
              <div 
                key={msg.id} 
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.isMe ? 'flex-end' : 'flex-start'
                }}
                onClick={() => handleReplyClick(msg)}
              >
                {msg.replyTo && originalMessage && (
                  <div style={{
                    width: '100%',
                    marginBottom: '5px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    borderLeft: '3px solid #7DC387',
                    maxWidth: '80%',
                    marginLeft: msg.isMe ? '0' : '42px',
                    opacity: 0.8
                  }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {originalMessage.displayName}: 
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {originalMessage.text}
                    </div>
                  </div>
                )}
                
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
                    borderBottomLeftRadius: msg.isMe ? '15px' : '5px'
                  }}>
                    {msg.replyTo && !originalMessage && (
                      <div style={{
                        fontStyle: 'italic',
                        fontSize: '0.85rem',
                        marginBottom: '5px',
                        opacity: 0.7
                      }}>
                        (Original message not found)
                      </div>
                    )}
                    <p style={{ 
                      margin: 0,
                      fontSize: '0.95rem',
                      whiteSpace: 'pre-wrap'
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
            );
          })
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
            disabled={!newMessage.trim() || !isUsernameLocked}
            style={{
              padding: '0 20px',
              backgroundColor: isUsernameLocked ? '#7DC387' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontWeight: '600',
              cursor: isUsernameLocked ? 'pointer' : 'not-allowed',
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
        
