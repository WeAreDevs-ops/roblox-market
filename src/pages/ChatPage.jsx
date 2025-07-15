
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
import './ChatPage.css';

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
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-title-section">
            <h1 className="chat-title">
              💬 Marketplace Chat
            </h1>
            <div className="chat-subtitle">
              <span className="current-user">@{username}</span>
              <div className="online-indicator">
                <span className="status-online">{onlineUsers.length + 1} online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="chat-messages-container">
        {messages.map((msg) => {
          const originalMessage = msg.replyTo ? getOriginalMessage(msg.replyTo) : null;
          return (
            <div
              key={msg.id}
              ref={el => messageRefs.current[msg.id] = el}
              className={`message-wrapper ${msg.isMe ? 'message-own' : 'message-other'}`}
            >
              {msg.replyTo && originalMessage && (
                <div className="message-reply-indicator">
                  <span className="reply-arrow">↳</span> replied to <strong>{originalMessage.displayName}</strong>
                </div>
              )}

              <div className="message-content">
                {!msg.isMe && (
                  <div className="message-avatar">
                    <img src={msg.photoURL} alt={`${msg.displayName} avatar`} />
                  </div>
                )}
                
                <div className={`message-bubble ${msg.isMe ? 'bubble-own' : 'bubble-other'}`}>
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

              <div className="message-meta">
                {!msg.isMe && <span className="message-author">{msg.displayName}</span>}
                <span className="message-time">{formatTime(msg.createdAt)}</span>
                <button
                  onClick={() => setReplyingTo(msg)}
                  className="reply-btn"
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
        <div className="chat-reply-banner">
          <div className="reply-content">
            <span className="reply-text">
              <strong>Replying to {replyingTo.displayName}:</strong> "{replyingTo.text.slice(0, 30)}{replyingTo.text.length > 30 ? '...' : ''}"
            </span>
          </div>
          <button onClick={cancelReply} className="reply-cancel-btn">
            ×
          </button>
        </div>
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="chat-typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </span>
        </div>
      )}

      {/* Username Setup */}
      {!isUsernameLocked && (
        <div className="chat-username-setup">
          <div className="username-setup-content">
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              placeholder="✨ Choose your display name"
              className="username-input"
            />
            <button onClick={saveUsername} className="username-save-btn">
              Set Name
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={sendMessage} className="chat-input-form">
        <div className="chat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="💭 Type your message..."
            className="chat-input"
            disabled={!isUsernameLocked}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isUsernameLocked}
            className={`chat-send-btn ${isUsernameLocked && newMessage.trim() ? 'enabled' : 'disabled'}`}
          >
            <span className="send-icon">➤</span>
          </button>
        </div>
      </form>
    </div>
  );
}
