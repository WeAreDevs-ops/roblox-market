import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { useNotification } from '../useNotification'; // Correct import path for notifications

const BANNED_WORDS = [
  // ... existing banned words ...
];

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

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
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const bottomRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { requestPermission, showNotification } = useNotification();

  // Notification setup
  useEffect(() => {
    requestPermission();
  }, []);

  // Listen for typing indicators
  useEffect(() => {
    const q = query(collection(db, 'typing_indicators'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typingData = {};
      snapshot.forEach((doc) => {
        typingData[doc.id] = doc.data();
      });
      const users = Object.values(typingData)
        .filter(user => user.userId !== localStorage.getItem('guestId'))
        .map(user => user.displayName);
      setTypingUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // Track typing status
  const handleTyping = useCallback(() => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Update typing status in Firestore
    const typingRef = doc(db, 'typing_indicators', localStorage.getItem('guestId'));
    updateDoc(typingRef, {
      displayName: username,
      userId: localStorage.getItem('guestId'),
      typing: true,
      lastTyped: serverTimestamp()
    });

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateDoc(typingRef, {
        typing: false
      });
    }, 1500);
  }, [username]);

  // Improved scroll behavior
  const handleScroll = useCallback(() => {
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (!messagesContainer) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    const nearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
    
    if (nearBottom && messagesContainer.scrollBehavior !== 'smooth') {
      messagesContainer.scrollBehavior = 'smooth';
    } else if (!nearBottom) {
      messagesContainer.scrollBehavior = 'auto';
    }
  }, []);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Fetch messages
  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isMe: doc.data().userId === localStorage.getItem('guestId'),
        reactions: doc.data().reactions || {}
      }));
      
      setMessages(msgs);
      
      // Show notification for new messages not from current user
      const newMessages = msgs.filter(msg => 
        !msg.isMe && 
        (!messages.some(m => m.id === msg.id))
      );
      
      if (newMessages.length > 0) {
        showNotification({
          title: `${newMessages[0].displayName}`,
          body: newMessages[0].text,
          icon: newMessages[0].photoURL
        });
      }

      scrollToBottom();
    });
    
    return () => unsubscribe();
  }, [messages]);

  // Online status tracking
  useEffect(() => {
    const statusRef = doc(db, 'user_status', localStorage.getItem('guestId'));
    const unsubscribe = onSnapshot(collection(db, 'user_status'), (snapshot) => {
      const statuses = {};
      snapshot.forEach(doc => {
        statuses[doc.id] = doc.data().online;
      });
      setOnlineUsers(statuses);
    });

    // Set user online
    updateDoc(statusRef, {
      displayName: username,
      online: true,
      lastActive: serverTimestamp()
    });

    // Handle window close/tab change
    const handleBeforeUnload = () => {
      updateDoc(statusRef, {
        online: false,
        lastActive: serverTimestamp()
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateDoc(statusRef, {
        online: false,
        lastActive: serverTimestamp()
      });
    };
  }, [username]);

  const addReaction = async (messageId, emoji) => {
    const messageRef = doc(db, 'public_messages', messageId);
    const message = messages.find(m => m.id === messageId);
    const newReactions = {...message.reactions};
    
    const userId = localStorage.getItem('guestId');
    if (newReactions[emoji]) {
      if (newReactions[emoji].includes(userId)) {
        newReactions[emoji] = newReactions[emoji].filter(id => id !== userId);
      } else {
        newReactions[emoji].push(userId);
      }
    } else {
      newReactions[emoji] = [userId];
    }
    
    await updateDoc(messageRef, { reactions: newReactions });
    setShowEmojiPicker(null);
  };

  // ... existing functions like sendMessage, formatTime, saveUsername ...

  return (
    <div style={{ /* ... existing styles ... */ }}>
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
      <div 
        ref={messagesEndRef}
        style={{ /* ... existing styles ... */ }}
        onScroll={handleScroll}
      >
        {/* Jump to bottom button when scrolled up */}
        <button 
          onClick={() => scrollToBottom()} 
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '80px',
            backgroundColor: '#7DC387',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ↓
        </button>

        {/* Messages rendering */}
        {messages.map((msg) => (
          <div key={msg.id} style={{ /* ... existing styles ... */ }}>
            {/* Reply highlight system */}
            {msg.replyTo && (
              <div 
                onClick={() => {
                  const element = document.getElementById(`msg-${msg.replyTo}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                  element?.classList.add('highlight-message');
                  setTimeout(() => element?.classList.remove('highlight-message'), 2000);
                }}
                style={{
                  /* ... reply styles ... */
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Replying to: {msg.replyingToUser } - {msg.replyingToText}
              </div>
            )}

            {/* Message bubble */}
            <div style={{ /* ... existing styles ... */ }}>
              {/* Online status indicator */}
              {!msg.isMe && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: onlineUsers[msg.userId] ? '#4CAF50' : '#ccc',
                  border: '2px solid white'
                }} />
              )}

              {/* Message content */}
              {msg.text}

              {/* Emoji reactions */}
              <div style={{
                display: 'flex',
                gap: '5px',
                marginTop: '5px',
                flexWrap: 'wrap'
              }}>
                {Object.entries(msg.reactions || {}).map(([emoji, users]) => (
                  <div 
                    key={emoji}
                    style={{
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover .reaction-tooltip': { display: 'block' }
                    }}
                  >
                    <span 
                      onClick={() => addReaction(msg.id, emoji)}
                      style={{
                        fontSize: '1.2rem',
                        padding: '2px 5px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '15px'
                      }}
                    >
                      {emoji} {users.length}
                    </span>
                    <div className="reaction-tooltip" style={{
                      display: 'none',
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#333',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      zIndex: 100
                    }}>
                      {users.map(userId => {
                        const user = messages.find(m => m.userId === userId)?.displayName || 'Unknown';
                        return <div key={userId}>{user}</div>;
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Emoji picker trigger */}
                <button 
                  onClick={() => setShowEmojiPicker(msg.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    opacity: 0.5,
                    '&:hover': { opacity: 1 }
                  }}
                >
                  +
                </button>
                
                {/* Emoji picker */}
                {showEmojiPicker === msg.id && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    padding: '5px',
                    display: 'flex',
                    gap: '5px',
                    zIndex: 10
                  }}>
                    {EMOJI_REACTIONS.map(emoji => (
                      <span
                        key={emoji}
                        onClick={() => addReaction(msg.id, emoji)}
                        style={{
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          padding: '5px',
                          '&:hover': { transform: 'scale(1.2)' }
                        }}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} style={{ /* ... existing styles ... */ }}>
        <input
          /* ... existing props ... */
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
        />
        {/* ... rest of the input area ... */}
      </form>

      {/* Message highlight animation */}
      <style>{`
        .highlight-message {
          animation: highlight 2s;
        }
        @keyframes highlight {
          0% { background-color: rgba(125, 195, 135, 0.3); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
      }
          
