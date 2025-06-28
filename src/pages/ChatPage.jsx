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

const BANNED_WORDS = [/* same banned list */];

export default function ChatPage() {
  const db = getFirestore();
  const messagesRef = collection(db, 'public_messages');
  const typingRef = collection(db, 'typing_indicators');
  const onlineRef = collection(db, 'online_users');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tempUsername, setTempUsername] = useState(localStorage.getItem('chatUsername') || '');
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
    const defaultUsername = localStorage.getItem('chatUsername') || `Guest${Math.floor(Math.random() * 1000)}`;
    if (!localStorage.getItem('chatUsername')) {
      setUsername(defaultUsername);
      setTempUsername(defaultUsername);
    }

    const userDoc = doc(onlineRef, guestId);
    setDoc(userDoc, {
      userId: guestId,
      displayName: defaultUsername,
      lastSeen: Date.now()
    });

    const interval = setInterval(() => {
      setDoc(userDoc, {
        userId: guestId,
        displayName: localStorage.getItem('chatUsername') || defaultUsername,
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
        if (now - data.lastSeen < 20000 && data.userId !== localStorage.getItem('guestId')) {
          users.push(data.displayName);
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
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`,
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
    if (tempUsername.trim()) {
      localStorage.setItem('chatUsername', tempUsername);
      setUsername(tempUsername);
      setIsUsernameLocked(true);
    }
  };

  const cancelReply = () => setReplyingTo(null);
  const getOriginalMessage = (id) => messages.find(m => m.id === id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#7DC387', color: 'white', padding: '15px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Marketplace Chat</h1>
        <p style={{ margin: 0 }}>
          Logged in as: <strong>{username}</strong> | Online: {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'}
        </p>
      </div>

      {/* Reply Prompt */}
      {replyingTo && (
        <div style={{ padding: '10px', backgroundColor: '#e4f0e4', textAlign: 'center', borderBottom: '1px solid #ccc' }}>
          <span style={{ fontWeight: 'bold' }}>Replying to {replyingTo.displayName}: "{replyingTo.text}"</span>
          <button onClick={cancelReply} style={{ marginLeft: '10px', color: '#7DC387', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div style={{ padding: '8px 15px', fontStyle: 'italic', backgroundColor: '#f0f0f0', color: '#666' }}>
          {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
        </div>
      )}

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
        {messages.map((msg) => {
          const originalMessage = msg.replyTo ? getOriginalMessage(msg.replyTo) : null;
          return (
            <div
              key={msg.id}
              ref={el => messageRefs.current[msg.id] = el}
              style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: msg.isMe ? 'flex-end' : 'flex-start' }}
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
                  borderRadius: '15px'
                }}>
                  <p style={{ margin: 0 }}>{msg.text}</p>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888', marginLeft: msg.isMe ? '0' : '42px', marginTop: '4px' }}>
                {!msg.isMe && <strong>{msg.displayName}</strong>} {formatTime(msg.createdAt)} &nbsp;
                <button
                  onClick={() => setReplyingTo(msg)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7DC387',
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

      {/* Username form */}
      {!isUsernameLocked && (
        <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderTop: '1px solid #ddd' }}>
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Enter a username"
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #ccc', marginRight: '10px' }}
          />
          <button
            onClick={saveUsername}
            style={{ padding: '8px 16px', backgroundColor: '#7DC387', border: 'none', color: 'white', borderRadius: '10px' }}
          >
            Set Username
          </button>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={sendMessage} style={{ padding: '15px', backgroundColor: 'white', borderTop: '1px solid #eee' }}>
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
            type="submit"
            disabled={!newMessage.trim() || !isUsernameLocked}
            style={{
              padding: '0 20px',
              backgroundColor: isUsernameLocked ? '#7DC387' : '#ccc',
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
      </form>
    </div>
  );
                    }
