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
  const messagesRef = collection(db, 'public_messages'); // Changed collection name
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('Guest'); // Default username
  const bottomRef = useRef(null);

  // Auto-generate a random guest ID if not set
  useEffect(() => {
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', `guest_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, []);

  // Fetch messages in real-time
  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => unsubscribe();
  }, []);

  // Send new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        displayName: username || 'Guest',
        userId: localStorage.getItem('guestId') || 'unknown'
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-600 p-4 text-white">
        <h1 className="text-xl font-bold">Public Marketplace Chat</h1>
        <p className="text-sm opacity-90">
          Everyone can chat - no login required
        </p>
      </div>

      {/* Username Input */}
      <div className="bg-white p-3 border-b">
        <label className="block text-sm font-medium mb-1">
          Display Name:
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded"
          maxLength={20}
        />
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.userId === localStorage.getItem('guestId') ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs rounded-lg p-3 ${
                msg.userId === localStorage.getItem('guestId') 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none shadow'
              }`}>
                {msg.userId !== localStorage.getItem('guestId') && (
                  <div className="font-bold text-xs mb-1">
                    {msg.displayName || 'Guest'}
                  </div>
                )}
                <p>{msg.text}</p>
                <div className={`text-xs mt-1 ${
                  msg.userId === localStorage.getItem('guestId') 
                    ? 'text-blue-100' 
                    : 'text-gray-500'
                }`}>
                  {msg.createdAt?.toDate?.().toLocaleTimeString() || 'now'}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white rounded-full px-4 py-2 disabled:opacity-50 hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
