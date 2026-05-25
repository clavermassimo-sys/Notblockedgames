import { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { Bot, Send, Trash2, Zap } from 'lucide-react';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are an AI assistant embedded in "The Cool Place" — an unblocked games hub. You help players with:
- Game tips, strategies, and walkthroughs
- Recommending games based on mood/preference
- General questions and friendly conversation
- Keeping it brief and fun — this is a gaming site, not a lecture hall

Be concise, energetic, and a bit edgy to match the site's vibe. Use gaming lingo naturally.`;

export default function ClaudeChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg = { role: 'user', content: text };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsStreaming(true);

    const assistantPlaceholder = { role: 'assistant', content: '' };
    setMessages([...updatedHistory, assistantPlaceholder]);

    try {
      const apiMessages = updatedHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const stream = client.messages.stream({
        model: 'claude-opus-4-7',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
        thinking: { type: 'adaptive' },
      });

      let accumulated = '';
      stream.on('text', (chunk) => {
        accumulated += chunk;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: accumulated };
          return next;
        });
      });

      await stream.finalMessage();
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: process.env.ANTHROPIC_API_KEY
            ? `Error: ${err.message}`
            : 'Add your ANTHROPIC_API_KEY to .env to enable AI chat.',
        };
        return next;
      });
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full font-mono text-[12px]">
      {/* Header */}
      <div className="bg-neon-yellow text-black font-black uppercase italic p-3 text-sm tracking-tighter flex justify-between items-center shrink-0">
        <span className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AI Assistant
        </span>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="flex items-center gap-1 text-[10px] font-bold not-italic">
              <Zap className="w-3 h-3 animate-pulse" />
              THINKING
            </span>
          )}
          <button
            onClick={() => setMessages([])}
            className="opacity-60 hover:opacity-100 transition-opacity"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="text-center space-y-3 py-8">
            <Bot className="w-8 h-8 text-neon-yellow mx-auto opacity-50" />
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest">
              // AI_READY — ask me anything
            </p>
            <div className="space-y-2 text-left">
              {[
                'How do I beat level 5 in Vex 9?',
                'What\'s a good game if I like puzzles?',
                'Give me Slope tips',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  className="block w-full text-left text-[10px] text-zinc-500 border border-zinc-800 hover:border-neon-yellow hover:text-neon-yellow px-3 py-1.5 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] uppercase tracking-widest opacity-40">
              {msg.role === 'user' ? 'YOU' : 'CLAUDE'}
            </span>
            <div
              className={`max-w-[85%] px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-neon-yellow text-black font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
              }`}
            >
              {msg.content || (isStreaming && i === messages.length - 1 ? (
                <span className="inline-block w-2 h-3 bg-neon-yellow animate-pulse" />
              ) : '')}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-800 bg-[#0F0F0F] shrink-0">
        <div className="flex border border-zinc-700 bg-black focus-within:border-neon-yellow transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask the AI..."
            disabled={isStreaming}
            className="bg-transparent flex-1 text-xs outline-none px-3 py-2 placeholder:opacity-30 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="text-neon-yellow px-3 hover:bg-neon-yellow hover:text-black transition-colors disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-zinc-600 mt-1.5">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
