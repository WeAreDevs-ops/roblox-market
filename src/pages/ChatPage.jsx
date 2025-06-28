import React, { useState, useEffect, useRef } from 'react';
import { Send, Reply, X, Users, MessageCircle, Smile } from 'lucide-react';

const BANNED_WORDS = [
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'nigger',
  'whore', 'slut', 'dick', 'pussy', 'cock', 'fag', 'retard',
  'sex', 'rape', 'porn', 'idiot', 'stupid', 'loser',
  'bastard', 'dumb', 'fool', 'jerk', 'scum', 'creep',
  'tramp', 'skank', 'pimp', 'freak', 'iyot', 'bobo', 'bbo', 'fuckyou',
  'fuck you', 'bold', 'putangina', 'puta', 'pota', 'p0ta', 'tangina', 'tanginamo',
  'wtf', 'what the fuck', 'yw', 'yawa', 'nudes', 'vcs', 'tanga', 'tsnga', 't4nga',
];

const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙏'];

export default function ChatPage() {
  // Mock data and state management
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Welcome to the enhanced chat system! 🎉',
      createdAt: new Date(),
      displayName: 'System',
      userId: 'system',
      photoURL: 'https://ui-avatars.com/api/?name=System&background=6366f1&color=fff',
      isMe: false
    },
    {
      id: '2',
      text: 'This is a demo with all the new features working!',
      createdAt: new Date(Date.now() - 30000),
      displayName: 'Demo User',
      userId: 'demo',
      photoURL: 'https://ui-avatars.com/api/?name=Demo%20User&background=random&color=fff',
      isMe: false
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [tempUsername, setTempUsername] = useState(
    `Guest${Math.floor(Math.random() * 1000)}`
  );
  const [username, setUsername] = useState('');
  const [isUsernameLocked, setIsUsernameLocked] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState(['Demo User']);
  const [onlineUsers, setOnlineUsers] = useState(['Demo User', 'System Bot', 'Chat Helper']);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [messageCount, setMessageCount] = useState(2);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const [currentUserId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  
  const bottomRef = useRef(null);
  const messageRefs = useRef({});
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Simulate typing indicator clearing
  useEffect(() => {
    const timer = setTimeout(() => {
      setTypingUsers([]);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate new messages arriving
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const demoMessages = [
          'Hey everyone! How is everyone doing?',
          'This chat system looks amazing! 🔥',
          'Love the new emoji picker feature!',
          'The UI is so clean and modern 💯',
          'Great work on the enhancements!'
        ];
        
        const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
        const newMsg = {
          id: `demo_${Date.now()}`,
          text: randomMessage,
          createdAt: new Date(),
          displayName: 'Demo User',
          userId: 'demo',
          photoURL: 'https://ui-avatars.com/api/?name=Demo%20User&background=random&color=fff',
          isMe: false
        };
        
        setMessages(prev => [...prev, newMsg]);
        setMessageCount(prev => prev + 1);
        
        if (isScrolledUp) {
          setNewMessageAlert(true);
        }
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isScrolledUp]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isScrolledUp) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isScrolledUp]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
        setIsScrolledUp(!isAtBottom);
        
        if (isAtBottom) {
          setNewMessageAlert(false);
        }
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const containsBannedWords = (text) => {
    return BANNED_WORDS.some(badWord => text.toLowerCase().includes(badWord));
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    if (containsBannedWords(newMessage)) {
      alert("Your message contains blocked words.");
      return;
    }

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      text: newMessage,
      createdAt: new Date(),
      displayName: username,
      userId: currentUserId,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`,
      replyTo: replyingTo ? replyingTo.id : null,
      replyingTo: replyingTo ? replyingTo.displayName : null,
      replyingToText: replyingTo ? replyingTo.text : null,
      isMe: true
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setTypingUsers([]);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Simulate typing indicator
    if (e.target.value && !typingUsers.includes(username)) {
      setTypingUsers(prev => [...prev, username]);
      
      // Clear typing after 3 seconds of no typing
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(user => user !== username));
      }, 3000);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'now';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessageAlert(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold">Marketplace Chat</h1>
              <p className="text-sm opacity-90">
                Welcome, <span className="font-semibold">{username}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowOnlineUsers(!showOnlineUsers)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{onlineUsers.length + 1}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Online Users Dropdown */}
      {showOnlineUsers && (
        <div className="bg-white border-b shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Online Users ({onlineUsers.length + 1})</h3>
          <div className="flex flex-wrap gap-2">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
              {username} (You)
            </span>
            {onlineUsers.map((user, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {user}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reply Banner */}
      {replyingTo && (
        <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Reply className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-gray-700">
              Replying to <span className="font-semibold">{replyingTo.displayName}</span>: 
              <span className="italic ml-1">"{replyingTo.text.substring(0, 50)}{replyingTo.text.length > 50 ? '...' : ''}"</span>
            </span>
          </div>
          <button
            onClick={cancelReply}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-b">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>
              {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
      >
        {messages.map((msg) => {
          const originalMessage = msg.replyTo ? getOriginalMessage(msg.replyTo) : null;
          return (
            <div
              key={msg.id}
              ref={el => messageRefs.current[msg.id] = el}
              className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} transition-all duration-200`}
            >
              {msg.replyTo && originalMessage && (
                <div className="text-xs text-gray-500 mb-1 mx-2">
                  replied to <span className="font-semibold">{originalMessage.displayName}</span>
                </div>
              )}

              <div className={`flex items-end space-x-2 max-w-xs sm:max-w-md lg:max-w-lg ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!msg.isMe && (
                  <div 
                    className="w-8 h-8 rounded-full bg-cover bg-center flex-shrink-0 ring-2 ring-white shadow-sm"
                    style={{ backgroundImage: `url(${msg.photoURL})` }}
                  />
                )}
                
                <div className={`relative px-4 py-2 rounded-2xl shadow-sm ${
                  msg.isMe 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                }`}>
                  {msg.replyTo && originalMessage && (
                    <div
                      onClick={() => {
                        const target = messageRefs.current[msg.replyTo];
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          target.classList.add('ring-4', 'ring-yellow-300', 'ring-opacity-75');
                          setTimeout(() => {
                            target.classList.remove('ring-4', 'ring-yellow-300', 'ring-opacity-75');
                          }, 2000);
                        }
                      }}
                      className={`mb-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        msg.isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-xs font-semibold opacity-80">
                        {originalMessage.displayName}
                      </div>
                      <div className="text-xs opacity-70 line-clamp-2">
                        {originalMessage.text}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                </div>
              </div>

              <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${msg.isMe ? 'flex-row-reverse space-x-reverse' : 'ml-10'}`}>
                {!msg.isMe && <span className="font-medium">{msg.displayName}</span>}
                <span>{formatTime(msg.createdAt)}</span>
                <button
                  onClick={() => setReplyingTo(msg)}
                  className="hover:text-emerald-600 transition-colors flex items-center space-x-1"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* New Message Alert */}
      {newMessageAlert && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer hover:bg-emerald-600 transition-colors z-10" onClick={scrollToBottom}>
          <span className="text-sm font-medium">New messages ↓</span>
        </div>
      )}

      {/* Username Input */}
      {!isUsernameLocked && (
        <div className="bg-white border-t p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              placeholder="Enter your username"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && saveUsername()}
            />
            <button 
              onClick={saveUsername}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
            >
              <span>Save</span>
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 bg-white rounded-lg shadow-xl border p-3 z-20">
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="bg-white border-t shadow-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-emerald-500 transition-colors p-2"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
              disabled={!isUsernameLocked}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isUsernameLocked}
            className={`p-3 rounded-full transition-all duration-200 ${
              isUsernameLocked && newMessage.trim()
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
                                           }
