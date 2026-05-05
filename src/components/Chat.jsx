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
import { signInAnonymously, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { LogIn, AlertCircle } from 'lucide-react';

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
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthError(null);
      } else {
        // Attempt anonymous sign in by default
        signInAnonymously(auth).catch((err) => {
          if (err.code === 'auth/admin-restricted-operation') {
            setAuthError('Anonymous auth is disabled. Please enable it in Firebase Console or sign in with Google.');
          } else {
            setAuthError(err.message);
          }
        });
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

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const path = 'messages';
    try {
      await addDoc(collection(db, path), {
        text: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || `Player_${user.uid.slice(0, 4)}`,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        {authError ? (
          <>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-[10px] uppercase font-mono leading-relaxed">
              <AlertCircle className="w-4 h-4 mb-2 mx-auto" />
              {authError}
            </div>
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 bg-neon-yellow text-black font-black uppercase italic px-4 py-2 text-xs hover:scale-105 transition-transform"
            >
              <LogIn className="w-3 h-3" />
              Sign in with Google
            </button>
          </>
        ) : (
          <p className="text-zinc-500 animate-pulse font-mono text-xs uppercase tracking-widest">
            // AUTH_INITIALIZING...
          </p>
        )}
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
          // SYSTEM_INITIALIZED: SESSION_START (ID: {user.uid.slice(0,8)})
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
