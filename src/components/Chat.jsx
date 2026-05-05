import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        signInAnonymously(auth).catch(console.error);
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const path = 'messages';
    try {
      await addDoc(collection(db, path), {
        text: newMessage.trim(),
        userId: user.uid,
        userName: `Player_${user.uid.slice(0, 4)}`,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500 animate-pulse font-mono text-sm uppercase">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden font-mono text-[12px]">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      >
        <div className="text-zinc-500 opacity-40 uppercase text-[10px] mb-6">
          // SYSTEM_INITIALIZED: SESSION_START
        </div>
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center gap-2">
              <span className={`font-bold ${msg.userId === user.uid ? 'text-neon-yellow' : 'text-zinc-500'}`}>
                {msg.userName}:
              </span>
              <span className="text-zinc-300">
                {msg.text}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800 bg-[#0F0F0F]">
        <div className="flex border border-zinc-700 bg-black p-1">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-transparent flex-1 text-xs outline-none px-3 py-1.5 placeholder:opacity-30"
          />
          <button 
            type="submit"
            className="text-neon-yellow font-bold text-[10px] uppercase tracking-widest px-3 hover:bg-neon-yellow hover:text-black transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
