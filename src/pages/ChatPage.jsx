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
  const messagesRef = collection(db, 'public_messages'); // Make sure this matches your Firestore collection name
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState(
    localStorage.getItem('chatUsername') || `Guest${Math.floor(Math.random() * 1000)}`
  );
  const bottomRef = useRef(null);

  // Initialize guest ID and save username
  useEffect(() => {
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', `guest_${Math.random().toString(36).substr(2, 9)}`);
    }
    localStorage.setItem('chatUsername', username);
  }, [username]);

  // Real-time messages listener
  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isMe: doc.data().userId === localStorage.getItem('guestId')
      }));
      setMessages(msgs);
      // Small timeout ensures scroll happens after DOM update
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=7DC387&color=fff`
      });
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return 'now';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#7DC387] text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Marketplace Chat</h1>
        <p className="text-sm opacity-90">
          Logged in as: <span className="font-semibold">{username}</span>
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" style={{ background: 'linear-gradient(180deg, #f5f7fa 0%, #eef2f5 100%)' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`mb-4 ${msg.isMe ? 'pl-10' : 'pr-10'}`}
            >
              {!msg.isMe && (
                <div className="flex items-center mb-1">
                  <img 
                    src={msg.photoURL} 
                    alt={msg.displayName} 
                    className="w-6 h-6 rounded-full mr-2" 
                  />
                  <span className="text-sm font-semibold">{msg.displayName}</span>
                </div>
              )}
              <div className={`relative max-w-xs mx-2 inline-block rounded-xl p-3 ${
                msg.isMe 
                  ? 'bg-[#7DC387] text-white float-right' 
                  : 'bg-white text-gray-800 float-left shadow-sm'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <span className={`absolute -bottom-4 text-xs ${
                  msg.isMe ? 'text-[#7DC387] right-2' : 'text-gray-500 left-2'
                }`}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="bg-white border-t p-4">
        <div className="flex items-center mb-2">
          <label className="text-sm text-gray-600 mr-2">Name:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 border rounded px-3 py-1 text-sm"
            maxLength={20}
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7DC387]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#7DC387] text-white rounded-full px-4 py-2 disabled:opacity-50 hover:bg-[#6bb077] transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
      }
  
