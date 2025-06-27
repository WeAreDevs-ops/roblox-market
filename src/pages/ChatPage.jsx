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
    localStorage.getItem('chatUsername') || 'Guest'
  );
  const bottomRef = useRef(null);

  // Generate guest ID on first visit
  useEffect(() => {
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', `guest_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, []);

  // Real-time messages
  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      displayName: username.trim() || 'Guest',
      userId: localStorage.getItem('guestId'),
      isMe: true
    });
    setNewMessage('');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return 'now';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Marketplace Chat</h1>
        <p className="text-xs opacity-90">Public chatroom - no login required</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4" style={{ background: 'linear-gradient(180deg, #f5f7fa 0%, #eef2f5 100%)' }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`mb-4 ${msg.userId === localStorage.getItem('guestId') ? 'pl-10' : 'pr-10'}`}
            >
              {/* Username Tag */}
              {msg.userId !== localStorage.getItem('guestId') && (
                <span className="text-xs font-medium text-gray-600 ml-1 mb-1 block">
                  {msg.displayName}
                </span>
              )}

              {/* Message Bubble */}
              <div className={`relative max-w-xs mx-2 inline-block rounded-xl p-3 ${
                msg.userId === localStorage.getItem('guestId') 
                  ? 'bg-blue-500 text-white float-right' 
                  : 'bg-white text-gray-800 float-left shadow-sm'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <span className={`absolute bottom-1 text-xs ${
                  msg.userId === localStorage.getItem('guestId') 
                    ? 'text-blue-100 right-2' 
                    : 'text-gray-500 left-2'
                }`}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Username Input */}
      <div className="border-t bg-white p-3">
        <div className="flex items-center mb-2">
          <span className="text-sm text-gray-600 mr-2">Name:</span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              localStorage.setItem('chatUsername', e.target.value);
            }}
            className="flex-1 border rounded px-3 py-1 text-sm"
            maxLength={20}
          />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white rounded-r-lg px-4 py-2 disabled:opacity-50 hover:bg-blue-700 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
                                   }
