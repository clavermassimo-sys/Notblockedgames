/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { ChevronLeft, Search, Gamepad2, Radio, MessageSquare, Bot, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './data/games.json';
import Chat from './components/Chat';
import ATCApp from './components/ATCApp';
import ClaudeChat from './components/ClaudeChat';

const CATEGORIES = ['All', 'Action', 'Arcade', 'Puzzle', 'Strategy', 'Racing', 'IO', 'Sports', 'Casual'];

const CATEGORY_COLORS = {
  Action: 'text-red-400 border-red-400/30 bg-red-400/10',
  Arcade: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  Puzzle: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  Strategy: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  Racing: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  IO: 'text-green-400 border-green-400/30 bg-green-400/10',
  Sports: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  Casual: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
};

const NAV_ITEMS = [
  { id: 'library', icon: Gamepad2, label: 'Games' },
  { id: 'atc',     icon: Radio,     label: 'ATC Live' },
  { id: 'chat',    icon: MessageSquare, label: 'Chat' },
  { id: 'ai',      icon: Bot,        label: 'AI Chat' },
];

export default function App() {
  const [games] = useState(gamesData);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('library');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, searchQuery, activeCategory]);

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (id !== 'library') setSelectedGame(null);
  };

  return (
    <div className="h-screen bg-app-bg text-white font-sans flex overflow-hidden border-4 border-border-dark selection:bg-neon-yellow selection:text-black">
      {/* Sidebar Nav */}
      <nav className="w-16 bg-black border-r border-zinc-800 flex flex-col items-center py-4 gap-1 shrink-0 z-50">
        {/* Logo */}
        <div
          className="w-10 h-10 bg-neon-yellow flex items-center justify-center cursor-pointer mb-4 hover:scale-105 transition-transform"
          onClick={() => { setActiveTab('library'); setSelectedGame(null); }}
          title="The Cool Place"
        >
          <span className="text-black font-black text-lg italic leading-none">C</span>
        </div>

        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleNavClick(id)}
            title={label}
            className={`w-12 h-12 flex flex-col items-center justify-center gap-1 rounded transition-all group ${
              activeTab === id
                ? 'bg-neon-yellow text-black'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase tracking-wider leading-none opacity-70">
              {label.split(' ')[0]}
            </span>
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar — only for library */}
        {activeTab === 'library' && !selectedGame && (
          <div className="h-14 border-b border-zinc-800 bg-panel-bg flex items-center px-5 gap-4 shrink-0">
            <h1 className="text-xl font-black italic tracking-tighter text-neon-yellow whitespace-nowrap">
              THE COOL PLACE.
            </h1>
            <div className="h-5 w-px bg-zinc-800" />
            {/* Category filters */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-neon-yellow text-black border-neon-yellow'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative ml-auto w-56 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Search games..."
                className="w-full bg-black border border-zinc-800 py-1.5 pl-7 pr-3 text-xs font-mono focus:outline-none focus:border-neon-yellow transition-colors placeholder:opacity-30 rounded-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* ATC */}
          {activeTab === 'atc' && (
            <div className="absolute inset-0">
              <ATCApp />
            </div>
          )}

          {/* Chat */}
          {activeTab === 'chat' && (
            <div className="absolute inset-0 flex flex-col">
              <div className="bg-neon-yellow text-black font-black uppercase italic p-3 text-sm tracking-tighter flex justify-between items-center shrink-0">
                <span>Global Lobby Chat</span>
                <span className="flex items-center gap-2 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <Chat />
              </div>
            </div>
          )}

          {/* AI Chat */}
          {activeTab === 'ai' && (
            <div className="absolute inset-0">
              <ClaudeChat />
            </div>
          )}

          {/* Games Library */}
          {activeTab === 'library' && (
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin scrollbar-thumb-zinc-800">
              <AnimatePresence mode="wait">
                {!selectedGame ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {filteredGames.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredGames.map((game, idx) => (
                          <GameCard
                            key={game.id}
                            game={game}
                            idx={idx}
                            onClick={() => setSelectedGame(game)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-32 text-center font-mono text-zinc-600 uppercase tracking-[0.4em] text-sm">
                        [ NO_RESULTS_FOUND ]
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="player"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col"
                    style={{ height: 'calc(100vh - 3.5rem - 2rem)' }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => setSelectedGame(null)}
                        className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                      <div className="h-4 w-px bg-zinc-800" />
                      <h2 className="text-lg font-black italic uppercase tracking-tight text-neon-yellow">
                        {selectedGame.name}
                      </h2>
                      {selectedGame.category && (
                        <span className={`text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5 ${CATEGORY_COLORS[selectedGame.category] || ''}`}>
                          {selectedGame.category}
                        </span>
                      )}
                      <p className="text-xs text-zinc-500 ml-auto hidden md:block">
                        {selectedGame.description}
                      </p>
                    </div>
                    <div className="flex-1 bg-black border border-zinc-800 overflow-hidden min-h-0">
                      <iframe
                        src={selectedGame.iframeUrl}
                        className="w-full h-full border-none"
                        title={selectedGame.name}
                        allowFullScreen
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Footer status strip */}
      <div className="hidden" />
    </div>
  );
}

function GameCard({ game, idx, onClick }) {
  const catStyle = CATEGORY_COLORS[game.category] || 'text-zinc-500 border-zinc-700 bg-zinc-900';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.02, duration: 0.2 }}
      onClick={onClick}
      className="group cursor-pointer bg-zinc-950 border border-zinc-800 hover:border-neon-yellow transition-all hover:-translate-y-0.5 flex flex-col overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden bg-zinc-900">
        <img
          src={game.thumbnail}
          alt={game.name}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale-[50%] group-hover:grayscale-0"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-neon-yellow text-black font-black text-[10px] uppercase tracking-widest px-3 py-1.5 italic">
            Play Now
          </div>
        </div>
        {/* Category badge */}
        {game.category && (
          <span className={`absolute top-1.5 left-1.5 text-[8px] font-bold uppercase tracking-wider border px-1.5 py-0.5 backdrop-blur-sm ${catStyle}`}>
            {game.category}
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-2.5">
        <h3 className="font-black text-sm uppercase italic tracking-tight group-hover:text-neon-yellow transition-colors truncate">
          {game.name}
        </h3>
        <p className="text-[9px] text-zinc-600 mt-0.5 line-clamp-1">
          {game.description.split(' ').slice(0, 6).join(' ')}...
        </p>
      </div>
    </motion.div>
  );
}
