/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './data/games.json';
import Chat from './components/Chat';

export default function App() {
  const [games] = useState(gamesData);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-app-bg text-white font-sans flex flex-col border-8 border-border-dark selection:bg-neon-yellow selection:text-black">
      {/* Header */}
      <header className="h-[140px] border-b-4 border-neon-yellow flex items-end px-10 pb-6 justify-between bg-panel-bg z-50">
        <div className="cursor-pointer select-none" onClick={() => setSelectedGame(null)}>
          <h1 className="text-8xl font-black italic tracking-tighter leading-none text-neon-yellow">
            THE COOL PLACE.
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-60 mt-2">
            // Unblocked Games & Social Hub
          </p>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="flex gap-8 mb-1 hidden lg:flex">
            <button 
              onClick={() => setSelectedGame(null)}
              className={`font-bold text-sm tracking-widest uppercase pb-1 transition-all border-b-2 ${!selectedGame ? 'border-neon-yellow opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
            >
              Library
            </button>
            <button className="font-bold opacity-40 hover:opacity-100 transition-opacity text-sm tracking-widest uppercase pb-1">
              New
            </button>
            <button className="font-bold opacity-40 hover:opacity-100 transition-opacity text-sm tracking-widest uppercase pb-1">
              Legacy
            </button>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`font-bold transition-all text-sm tracking-widest uppercase pb-1 border-b-2 ${isChatOpen ? 'border-neon-yellow opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
            >
              Chat
            </button>
          </div>
          
          <div className="relative w-64">
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
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative scrollbar-thin scrollbar-thumb-zinc-800">
          <AnimatePresence mode="wait">
            {!selectedGame ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredGames.length > 0 ? (
                  filteredGames.map((game, idx) => (
                    <div 
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className="bg-zinc-900 border-2 border-zinc-800 hover:border-neon-yellow p-4 flex flex-col group cursor-pointer transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(224,255,0,0.1)]"
                    >
                      <div className="aspect-video bg-zinc-800 mb-3 relative overflow-hidden">
                        <img 
                          src={game.thumbnail} 
                          alt={game.name}
                          className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-neon-yellow opacity-5 group-hover:opacity-10" />
                        <div className="absolute bottom-2 left-2 font-mono text-[10px] bg-black px-2 py-1 border border-zinc-800">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}_PROJECT
                        </div>
                      </div>
                      <h3 className="font-black text-xl uppercase italic group-hover:text-neon-yellow transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest opacity-40 mt-1">
                        {game.description.split(' ').slice(0, 3).join(' ')} / Arcade
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center font-mono text-zinc-500 uppercase tracking-[0.5em]">
                    [ NO_RESULTS_FOUND ]
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="player"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedGame(null)}
                      className="p-2 bg-zinc-900 border border-zinc-800 hover:border-neon-yellow transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-neon-yellow">
                      {selectedGame.name}
                    </h2>
                  </div>
                </div>
                <div className="flex-1 bg-black border-2 border-zinc-800 relative group overflow-hidden">
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="bg-neon-yellow text-black text-[10px] font-black px-2 py-1 uppercase italic">Live Stream Target</span>
                  </div>
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
        </main>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l-4 border-zinc-800 bg-app-bg flex flex-col shadow-2xl relative"
            >
              <div className="bg-neon-yellow text-black font-black uppercase italic p-3 text-sm tracking-tighter flex justify-between items-center">
                <span>Global Lobby Chat</span>
                <span className="flex items-center gap-2 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  LIVE
                </span>
              </div>

              <Chat />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="h-12 border-t border-zinc-800 bg-black flex items-center px-10 justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <span className="text-neon-yellow font-bold">THE COOL PLACE //</span>
          <span>STATUS: <span className="text-green-500 font-bold">ALL SYSTEMS NOMINAL</span></span>
          <span className="opacity-20">|</span>
          <span>LOCATION: US-EAST-1</span>
        </div>
        <div className="flex gap-6">
          <span>ACTIVE_SESSIONS: 1,482</span>
          <span>PING: 24MS</span>
          <span>ENCRYPTION: AES-256</span>
          <span className="text-zinc-700">COORD: 40.7128° N, 74.0060° W</span>
        </div>
      </footer>
    </div>
  );
}
