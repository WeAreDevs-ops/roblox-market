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
import { getAuth } from 'firebase/auth';

export default function ChatPage() {
  // Firebase Refs
  const db = getFirestore();
  const auth = getAuth();
  const messagesRef = collection(db, 'messages');
  
  // State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Fetch messages in real-time
  useEffect(() => {
    setLoading(true);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => unsubscribe();
  }, []);

  // Send new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { uid, displayName, photoURL, email } = auth.currentUser;
    
    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid,
        displayName: displayName || email?.split('@')[0] || 'Anonymous',
        photoURL: photoURL || ''
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return '';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white">
        <h1 className="text-xl font-bold">Marketplace Chat</h1>
        <p className="text-sm opacity-80">
          {auth.currentUser?.displayName || auth.currentUser?.email}
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.uid === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${msg.uid === auth.currentUser?.uid 
                ? 'bg-indigo-500 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none shadow'
                }`}
              >
                {msg.uid !== auth.currentUser?.uid && (
                  <div className="font-bold text-xs mb-1">
                    {msg.displayName}
                  </div>
                )}
                <div className="text-sm">{msg.text}</div>
                <div className={`text-xs mt-1 ${msg.uid === auth.currentUser?.uid ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-indigo-600 text-white rounded-full px-4 py-2 disabled:opacity-50 hover:bg-indigo-700 transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
    }
            
