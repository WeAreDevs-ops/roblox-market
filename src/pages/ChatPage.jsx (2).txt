
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
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageRefs = useRef({});

  useEffect(() => {
    const guestId = localStorage.getItem('guestId') || `guest_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guestId', guestId);
    const chatUser = localStorage.getItem('chatUsername') || `Guest${Math.floor(Math.random() * 1000)}`;
    if (!localStorage.getItem('chatUsername')) {
      setUsername(chatUser);
      setTempUsername(chatUser);
    }

    const userDoc = doc(onlineRef, guestId);
    setDoc(userDoc, {
      userId: guestId,
      displayName: chatUser,
      lastSeen: Date.now()
    });

    const interval = setInterval(() => {
      setDoc(userDoc, {
        userId: guestId,
        displayName: chatUser,
        lastSeen: Date.now()
      });
    }, 10000);

    return () => {
      clearInterval(interval);
      deleteDoc(userDoc);
    };
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

  useEffect(() => {
    const unsubscribe = onSnapshot(onlineRef, (snapshot) => {
      const users = [];
      const now = Date.now();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (now - data.lastSeen < 20000) {
          if (data.userId !== localStorage.getItem('guestId')) {
            users.push(data.displayName);
          }
        }
      });
      setOnlineUsers(users);
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
      alert("Your message contains blocked words.");
      return;
    }

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        displayName: username,
        userId: localStorage.getItem('guestId'),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=4F46E5&color=fff`,
        replyTo: replyingTo ? replyingTo.id : null,
        replyingTo: replyingTo ? replyingTo.displayName : null,
        replyingToText: replyingTo ? replyingTo.text : null
      });
      setNewMessage('');
      setReplyingTo(null);
      await deleteDoc(doc(typingRef, localStorage.getItem('guestId')));
    } catch (error) {
      console.error("Send failed:", error);
    }
  };

  const handleInputChange = async (e) => {
    setNewMessage(e.target.value);
    const guestId = localStorage.getItem('guestId');
    const typingDoc = doc(typingRef, guestId);
    await setDoc(typingDoc, {
      userId: guestId,
      displayName: username,
      timestamp: Date.now()
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      deleteDoc(typingDoc);
    }, 3000);
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

  const cancelReply = () => setReplyingTo(null);
  const getOriginalMessage = (replyToId) => messages.find(msg => msg.id === replyToId);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#F8FAFC',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #4F46E5, #6366F1)', 
        color: 'white', 
        padding: '16px 20px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Marketplace Chat
        </h1>
        <p style={{ 
          margin: '4px 0 0', 
          fontSize: '14px', 
          opacity: 0.9,
          textAlign: 'center'
        }}>
          {username} • {onlineUsers.length + 1} online
        </p>
      </div>

      {/* Message List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px 12px',
        background: '#F8FAFC'
      }}>
        {messages.map((msg) => {
          const originalMessage = msg.replyTo ? getOriginalMessage(msg.replyTo) : null;
          return (
            <div
              key={msg.id}
              ref={el => messageRefs.current[msg.id] = el}
              style={{
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.isMe ? 'flex-end' : 'flex-start',
                maxWidth: '100%'
              }}
            >
              {msg.replyTo && originalMessage && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6B7280', 
                  marginBottom: '4px',
                  paddingLeft: msg.isMe ? '0' : '40px'
                }}>
                  ↳ replied to {originalMessage.displayName}
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                maxWidth: '85%',
                gap: '8px'
              }}>
                {!msg.isMe && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundImage: `url(${msg.photoURL})`,
                    backgroundSize: 'cover',
                    flexShrink: 0
                  }} />
                )}
                
                <div style={{
                  backgroundColor: msg.isMe ? '#4F46E5' : '#FFFFFF',
                  color: msg.isMe ? 'white' : '#1F2937',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderBottomRightRadius: msg.isMe ? '4px' : '16px',
                  borderBottomLeftRadius: msg.isMe ? '16px' : '4px',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: msg.isMe ? 'none' : '1px solid #E5E7EB',
                  maxWidth: '100%',
                  wordBreak: 'break-word'
                }}>
                  {msg.replyTo && originalMessage && (
                    <div
                      onClick={() => {
                        const target = messageRefs.current[msg.replyTo];
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          target.style.backgroundColor = '#FEF3C7';
                          setTimeout(() => { target.style.backgroundColor = ''; }, 1000);
                        }
                      }}
                      style={{
                        backgroundColor: msg.isMe ? 'rgba(255,255,255,0.15)' : '#F3F4F6',
                        borderLeft: `3px solid ${msg.isMe ? 'rgba(255,255,255,0.5)' : '#4F46E5'}`,
                        padding: '6px 8px',
                        marginBottom: '8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        opacity: 0.9
                      }}
                    >
                      <strong>{originalMessage.displayName}:</strong> {originalMessage.text.slice(0, 50)}{originalMessage.text.length > 50 ? '...' : ''}
                    </div>
                  )}
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </p>
                </div>
              </div>

              <div style={{ 
                marginTop: '4px', 
                marginLeft: msg.isMe ? '0' : '40px', 
                fontSize: '11px', 
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {!msg.isMe && <span style={{ fontWeight: '500' }}>{msg.displayName}</span>}
                <span>{formatTime(msg.createdAt)}</span>
                <button
                  onClick={() => setReplyingTo(msg)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    cursor: 'pointer',
                    fontSize: '11px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#4F46E5'}
                  onMouseLeave={(e) => e.target.style.color = '#6B7280'}
                >
                  Reply
                </button>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply Banner */}
      {replyingTo && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#EEF2FF', 
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '13px',
            color: '#4F46E5',
            fontWeight: '500'
          }}>
            Replying to {replyingTo.displayName}: "{replyingTo.text.slice(0, 30)}{replyingTo.text.length > 30 ? '...' : ''}"
          </span>
          <button
            onClick={cancelReply}
            style={{
              background: 'none',
              border: 'none',
              color: '#6B7280',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '2px 6px',
              borderRadius: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div style={{ 
          padding: '8px 16px', 
          fontStyle: 'italic', 
          color: '#6B7280', 
          backgroundColor: '#F9FAFB',
          fontSize: '12px',
          borderTop: '1px solid #E5E7EB'
        }}>
          {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
        </div>
      )}

      {/* Username Setup */}
      {!isUsernameLocked && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#FFFFFF', 
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Enter your username"
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              margin: 0
            }}
          />
          <button 
            onClick={saveUsername} 
            style={{
              padding: '10px 16px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* Input Area */}
      <form 
        onSubmit={sendMessage} 
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderTop: '1px solid #E5E7EB', 
          padding: '12px 16px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
              fontSize: '14px',
              margin: 0,
              resize: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isUsernameLocked}
            style={{
              padding: '12px 20px',
              backgroundColor: isUsernameLocked && newMessage.trim() ? '#4F46E5' : '#D1D5DB',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontWeight: '500',
              cursor: isUsernameLocked && newMessage.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              transition: 'background-color 0.2s ease'
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
