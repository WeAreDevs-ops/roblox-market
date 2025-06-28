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
import Swal from 'sweetalert2';

const BANNED_WORDS = [
  // ... (keep your existing banned words array)
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const bottomRef = useRef(null);

  // Initialize user and check screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', `guest_${Math.random().toString(36).substr(2, 9)}`);
    }
    if (!localStorage.getItem('chatUsername')) {
      setUsername(`Guest${Math.floor(Math.random() * 1000)}`);
      setTempUsername(`Guest${Math.floor(Math.random() * 1000)}`);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const containsBannedWords = (text) => {
    return BANNED_WORDS.some(badWord => text.toLowerCase().includes(badWord.toLowerCase()));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (containsBannedWords(newMessage)) {
      Swal.fire('Blocked Content', 'Your message contains inappropriate words', 'warning');
      return;
    }

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        displayName: username,
        userId: localStorage.getItem('guestId'),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`,
        ...(replyingTo && { 
          replyToId: replyingTo.id,
          replyText: replyingTo.text.substring(0, 50),
          replyUser: replyingTo.displayName 
        })
      });
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire('Error', 'Failed to send message', 'error');
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

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f0f2f5'
    },
    header: {
      backgroundColor: '#0084ff',
      color: 'white',
      padding: '12px 16px',
      textAlign: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    messagesContainer: {
      flex: 1,
      padding: '8px',
      overflowY: 'auto',
      background: 'linear-gradient(180deg, #f5f7fa 0%, #eef2f5 100%)'
    },
    messageBubble: (msg) => ({
      maxWidth: '80%',
      padding: '8px 12px',
      marginBottom: '4px',
      borderRadius: '18px',
      backgroundColor: msg.isMe ? '#0084ff' : '#e4e6eb',
      color: msg.isMe ? 'white' : 'black',
      cursor: 'pointer',
      alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
      wordBreak: 'break-word',
      position: 'relative'
    }),
    replyPreview: {
      fontSize: '0.8rem',
      color: '#65676b',
      padding: '4px 8px',
      marginBottom: '4px',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: '8px',
      borderLeft: '3px solid #0084ff',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    inputArea: {
      padding: '10px',
      backgroundColor: 'white',
      borderTop: '1px solid #e1e4e8',
      position: 'sticky',
      bottom: 0
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>Marketplace Chat</h1>
      </div>

      {/* Active Reply Preview */}
      {replyingTo && (
        <div style={{ 
          padding: '8px 12px',
          backgroundColor: '#f0f2f5',
          borderBottom: '1px solid #e4e6eb',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#65676b' }}>
            Replying to <strong>{replyingTo.displayName}</strong>: {replyingTo.text.substring(0, 50)}...
          </div>
          <button 
            onClick={cancelReply}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#65676b', 
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#65676b' }}>
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex',
                justifyContent: msg.isMe ? 'flex-end' : 'flex-start',
                marginBottom: '4px',
                position: 'relative'
              }}
            >
              <div 
                onClick={() => handleReplyClick(msg)}
                style={styles.messageBubble(msg)}
              >
                {msg.replyToId && (
                  <div style={styles.replyPreview}>
                    Replying to {msg.replyUser}: {msg.replyText}
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} style={styles.inputArea}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '8px',
          gap: '8px'
        }}>
          <label style={{
            fontSize: '0.8rem',
            color: '#65676b',
            whiteSpace: 'nowrap',
            display: isUsernameLocked ? 'none' : 'block'
          }}>
            Your Name:
          </label>
          <div style={{ 
            display: 'flex', 
            flex: 1,
            gap: '8px'
          }}>
            <input
              type="text"
              value={isUsernameLocked ? username : tempUsername}
              onChange={(e) => !isUsernameLocked && setTempUsername(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '18px',
                fontSize: '0.9rem',
                outline: 'none',
                display: !isUsernameLocked ? 'block' : 'none'
              }}
              maxLength={20}
            />
            {!isUsernameLocked && (
              <button
                type="button"
                onClick={saveUsername}
                style={{
                  padding: '0 12px',
                  backgroundColor: '#7DC387',
                  color: 'white',
                  border: 'none',
                  borderRadius: '18px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${isMobile ? '' : 'in Marketplace Chat'}`}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: '18px',
              backgroundColor: '#f0f2f5',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isUsernameLocked}
            style={{
              padding: '0 16px',
              backgroundColor: isUsernameLocked ? '#0084ff' : '#e4e6eb',
              color: isUsernameLocked ? 'white' : '#bcc0c4',
              border: 'none',
              borderRadius: '18px',
              fontWeight: 500,
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
        
