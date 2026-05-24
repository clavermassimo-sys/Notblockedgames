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
import {
  signInAnonymously,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Send, Edit2, Check, X } from 'lucide-react';

const USER_COLORS = [
  '#E0FF00', '#00FFB2', '#FF6B9D', '#00BFFF',
  '#FF6B35', '#A855F7', '#FF9500', '#00FF88',
];

function getUserColor(uid) {
  if (!uid) return USER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function formatTime(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getDefaultName(uid) {
  return `Player_${uid.slice(0, 6).toUpperCase()}`;
}

const QUICK_EMOJIS = ['👍', '😂', '🔥', '💀', '🎮', '🏆', '😎', '💯'];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        if (!u.displayName) {
          const saved = localStorage.getItem('chatUsername');
          const name = saved || getDefaultName(u.uid);
          try {
            await updateProfile(u, { displayName: name });
          } catch (_) {}
          if (!saved) {
            setEditingName(true);
            setNameInput(name);
          }
        }
        setUser({ ...u, displayName: u.displayName || localStorage.getItem('chatUsername') || getDefaultName(u.uid) });
        setAuthError(null);
      } else {
        signInAnonymously(auth).catch((err) => {
          setAuthError(err.code === 'auth/admin-restricted-operation'
            ? 'Anonymous auth disabled — enable it in Firebase Console.'
            : err.message);
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(75));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
    }, (err) => {
      console.error('Chat error:', err.message);
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  const saveName = async (e) => {
    e?.preventDefault();
    const name = nameInput.trim().slice(0, 20);
    if (!name || !user) return;
    localStorage.setItem('chatUsername', name);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
    } catch (_) {}
    setUser(prev => ({ ...prev, displayName: name }));
    setEditingName(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim().slice(0, 500);
    if (!text || !user) return;
    setNewMessage('');
    const userName = user.displayName || getDefaultName(user.uid);
    try {
      await addDoc(collection(db, 'messages'), {
        text,
        userId: user.uid,
        userName,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Send failed:', err.message);
    }
  };

  const appendEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        {authError ? (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono leading-relaxed">
            {authError}
          </div>
        ) : (
          <p className="text-zinc-500 animate-pulse font-mono text-[10px] uppercase tracking-widest">
            // AUTHENTICATING...
          </p>
        )}
      </div>
    );
  }

  const displayName = user.displayName || getDefaultName(user.uid);
  const myColor = getUserColor(user.uid);

  return (
    <div className="flex-1 flex flex-col overflow-hidden font-mono text-[11px]">

      {/* Identity bar */}
      <div className="px-3 py-2 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between shrink-0">
        {editingName ? (
          <form onSubmit={saveName} className="flex items-center gap-2 w-full">
            <span className="text-zinc-600 shrink-0 text-[10px]">NAME:</span>
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              placeholder="Your name..."
              className="bg-transparent border-b border-neon-yellow outline-none text-neon-yellow flex-1 min-w-0 placeholder:opacity-30"
            />
            <button type="submit" className="text-neon-yellow hover:opacity-70 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEditingName(false)}
              className="text-zinc-600 hover:text-zinc-400 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-zinc-600 text-[10px] shrink-0">YOU:</span>
              <span className="font-bold truncate" style={{ color: myColor }}>
                {displayName}
              </span>
            </div>
            <button
              onClick={() => { setEditingName(true); setNameInput(displayName); }}
              className="text-zinc-700 hover:text-zinc-400 transition-colors shrink-0"
              title="Change username"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}
      >
        <div className="text-zinc-700 text-[9px] uppercase text-center mb-3">
          ── SESSION START · {new Date().toLocaleDateString()} ──
        </div>

        {messages.length === 0 && (
          <div className="text-zinc-700 text-[10px] text-center mt-8 leading-loose">
            [ CHANNEL EMPTY ]<br />
            <span className="text-[9px] opacity-60">Say something to the lobby!</span>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.userId === user.uid;
          const color = getUserColor(msg.userId);
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-1.5 mb-0.5 px-0.5">
                <span className="text-[10px] font-bold" style={{ color }}>
                  {msg.userName}
                </span>
                {msg.createdAt && (
                  <span className="text-[9px] text-zinc-700">{formatTime(msg.createdAt)}</span>
                )}
              </div>
              <div
                className={`max-w-[88%] px-2.5 py-1.5 leading-relaxed break-words ${
                  isMe
                    ? 'bg-neon-yellow/8 border border-neon-yellow/20 text-zinc-100'
                    : 'bg-zinc-900 border border-zinc-800/80 text-zinc-300'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick emojis */}
      <div className="px-3 pt-2 pb-0 flex gap-1 shrink-0">
        {QUICK_EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => appendEmoji(emoji)}
            className="text-sm hover:scale-125 transition-transform"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-zinc-900 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-2 border border-zinc-800 bg-black px-3 py-2 focus-within:border-neon-yellow/40 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="type a message..."
            maxLength={500}
            className="bg-transparent flex-1 outline-none placeholder:text-zinc-700 text-zinc-200 text-[11px]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="text-neon-yellow disabled:opacity-20 hover:opacity-70 transition-opacity shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-zinc-700">
          <span>ENTER to send</span>
          <span className={newMessage.length > 450 ? 'text-red-500' : ''}>{newMessage.length}/500</span>
        </div>
      </form>
    </div>
  );
}
