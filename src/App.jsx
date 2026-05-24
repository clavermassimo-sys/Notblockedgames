/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ChevronRight, Search, ExternalLink, Menu, X, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './data/games.json';
import Chat from './components/Chat';

const CATEGORIES = [
  { id: 'all', label: 'All Games' },
  { id: 'action', label: 'Action' },
  { id: 'multiplayer', label: 'Multiplayer' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'sports', label: 'Sports' },
  { id: 'idle', label: 'Idle' },
  { id: 'classic', label: 'Classic' },
];

function useAnimatedCount(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function App() {
  const [games] = useState(gamesData);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onlineCount] = useState(1247 + Math.floor(Math.random() * 300));
  const animatedCount = useAnimatedCount(onlineCount, 1800);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setMobileMenuOpen(false);
  };

  const categoryCount = (catId) =>
    catId === 'all' ? games.length : games.filter(g => g.category === catId).length;

  return (
    <div className="min-h-screen bg-app-bg text-white font-sans flex flex-col border-4 border-border-dark selection:bg-neon-yellow selection:text-black">
      {/* Header */}
      <header className="border-b-4 border-neon-yellow flex items-center px-4 md:px-10 py-4 md:py-0 md:h-[120px] justify-between bg-panel-bg z-50 gap-4">
        <div className="cursor-pointer select-none shrink-0" onClick={() => setSelectedGame(null)}>
          <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-none text-neon-yellow">
            THE COOL PLACE.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50 mt-1 hidden md:block">
            // Unblocked Games & Global Chat
          </p>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex flex-col items-end gap-3">
          <div className="flex gap-6">
            <button
              onClick={() => setSelectedGame(null)}
              className={`font-bold text-sm tracking-widest uppercase pb-1 transition-all border-b-2 ${!selectedGame ? 'border-neon-yellow opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
            >
              Library
            </button>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`font-bold transition-all text-sm tracking-widest uppercase pb-1 border-b-2 ${isChatOpen ? 'border-neon-yellow opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
            >
              Chat
            </button>
          </div>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
            <input
              type="text"
              placeholder="SEARCH_DB..."
              className="w-full bg-black border border-zinc-800 rounded-none py-1.5 pl-8 pr-4 text-xs font-mono focus:outline-none focus:border-neon-yellow transition-colors placeholder:opacity-30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-black border border-zinc-800 rounded-none py-1.5 pl-7 pr-3 text-xs font-mono focus:outline-none focus:border-neon-yellow transition-colors placeholder:opacity-30 w-32"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-zinc-800 hover:border-neon-yellow transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-panel-bg border-b-2 border-zinc-800 overflow-hidden z-40"
          >
            <div className="p-4 flex gap-4">
              <button
                onClick={() => { setSelectedGame(null); setMobileMenuOpen(false); }}
                className="font-bold text-xs tracking-widest uppercase border-b-2 border-neon-yellow pb-1"
              >
                Library
              </button>
              <button
                onClick={() => { setIsChatOpen(!isChatOpen); setMobileMenuOpen(false); }}
                className={`font-bold text-xs tracking-widest uppercase border-b-2 pb-1 transition-colors ${isChatOpen ? 'border-neon-yellow' : 'border-transparent opacity-60'}`}
              >
                {isChatOpen ? 'Hide Chat' : 'Show Chat'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category filter bar */}
      {!selectedGame && (
        <div className="border-b-2 border-zinc-900 bg-panel-bg px-4 md:px-10 overflow-x-auto scrollbar-none">
          <div className="flex gap-1 min-w-max">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2.5 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                  selectedCategory === cat.id
                    ? 'border-neon-yellow text-neon-yellow'
                    : 'border-transparent opacity-40 hover:opacity-80'
                }`}
              >
                {cat.label}
                <span className="ml-1.5 opacity-50 font-mono">{categoryCount(cat.id)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative">
          <AnimatePresence mode="wait">
            {!selectedGame ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {filteredGames.map((game, idx) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.2 }}
                        onClick={() => handleSelectGame(game)}
                        className="bg-zinc-900 border-2 border-zinc-800 hover:border-neon-yellow flex flex-col group cursor-pointer transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(224,255,0,0.08)]"
                      >
                        <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                          <img
                            src={game.thumbnail}
                            alt={game.name}
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-90 transition-all duration-500 grayscale group-hover:grayscale-0"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                          <div className="absolute top-2 left-2">
                            <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-900/80 border border-zinc-700 px-1.5 py-0.5 text-zinc-400">
                              {game.category}
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2 font-mono text-[10px] bg-black/80 px-1.5 py-0.5 border border-zinc-800 text-zinc-500">
                            {String(idx + 1).padStart(2, '0')}_FILE
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-black text-base uppercase italic group-hover:text-neon-yellow transition-colors leading-tight">
                            {game.name}
                          </h3>
                          <p className="text-[10px] opacity-40 mt-1 leading-snug line-clamp-2">
                            {game.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center font-mono text-zinc-600 uppercase tracking-[0.5em]">
                    <Gamepad2 className="w-8 h-8 mx-auto mb-4 opacity-30" />
                    [ NO_RESULTS_FOUND ]
                    <p className="text-xs mt-2 tracking-normal opacity-60">Try a different search or category</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="player"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
                style={{ minHeight: 'calc(100vh - 240px)' }}
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedGame(null)}
                      className="p-2 bg-zinc-900 border border-zinc-800 hover:border-neon-yellow transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-neon-yellow leading-none">
                        {selectedGame.name}
                      </h2>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        {selectedGame.category}
                      </span>
                    </div>
                  </div>
                  <a
                    href={selectedGame.iframeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-neon-yellow transition-colors border border-zinc-800 hover:border-neon-yellow px-3 py-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in New Tab
                  </a>
                </div>
                <div className="flex-1 bg-black border-2 border-zinc-800 relative group overflow-hidden" style={{ minHeight: '500px' }}>
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-zinc-900/90 text-zinc-500 text-[9px] font-mono px-2 py-1 border border-zinc-700">
                      If game doesn't load → Open in New Tab
                    </span>
                  </div>
                  <iframe
                    src={selectedGame.iframeUrl}
                    className="w-full h-full border-none"
                    title={selectedGame.name}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  />
                </div>
                <p className="text-[10px] font-mono text-zinc-600 mt-2 text-center">
                  {selectedGame.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l-4 border-zinc-900 bg-app-bg flex flex-col shadow-2xl relative shrink-0 overflow-hidden"
            >
              <div className="bg-neon-yellow text-black font-black uppercase italic p-3 text-sm tracking-tighter flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  <span>Global Lobby</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono not-italic opacity-70">
                    {animatedCount.toLocaleString()} online
                  </span>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="opacity-60 hover:opacity-100 transition-opacity not-italic"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <Chat />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black flex items-center px-4 md:px-10 py-2.5 justify-between font-mono text-[9px] text-zinc-600 uppercase tracking-wider flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-neon-yellow font-bold">THE COOL PLACE //</span>
          <span>
            STATUS: <span className="text-green-500 font-bold">NOMINAL</span>
          </span>
          <span className="hidden md:inline">GAMES: <span className="text-zinc-400">{games.length}</span></span>
        </div>
        <div className="flex gap-4 hidden md:flex">
          <span>SESSIONS: {onlineCount.toLocaleString()}</span>
          <span>PING: {Math.floor(Math.random() * 20) + 12}MS</span>
          <span>ENC: AES-256</span>
        </div>
      </footer>
    </div>
  );
}
