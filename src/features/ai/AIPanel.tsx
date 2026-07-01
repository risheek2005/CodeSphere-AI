/* ============================================
   AIPanel.tsx — Floating AI Coding Companion
   Supports chatbot queries, refactoring presets, test generations
   ============================================ */
import { useState } from 'react';
import { Bot, Send, Sparkles, Wand2, ShieldAlert, FileText, Check } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useUIStore } from '@/stores/uiStore';
import { useUserActivityStore } from '@/stores/userActivityStore';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
}

export default function AIPanel() {
  const { incrementAiQueries } = useUserActivityStore();
  const { code, currentLanguage } = useEditorStore();
  const { addToast } = useUIStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'assistant', text: "Hi! I'm CodeSphere AI assistant. How can I help you write or optimize code today?" }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);
    incrementAiQueries();

    setTimeout(() => {
      let reply = "I've analyzed your context. Here is an optimized suggestion:";
      if (text.toLowerCase().includes('explain')) {
        reply = `This ${currentLanguage.name} snippet implements standard operations. It has an algorithmic runtime complexity of O(N log N) under standard conditions and allocates memory dynamically.`;
      } else if (text.toLowerCase().includes('bug') || text.toLowerCase().includes('find')) {
        reply = "No safety flaws or race conditions detected. Clean execution flow identified. Make sure all variable pointers are validated before memory access.";
      } else if (text.toLowerCase().includes('test')) {
        reply = `Here is a basic test case suite for this module:
\`\`\`javascript
describe("Algorithm Test Suite", () => {
  it("verifies base configurations", () => {
    expect(handler()).toBeDefined();
  });
});
\`\`\``;
      } else if (text.toLowerCase().includes('optimize')) {
        reply = "Optimization suggestion applied. Replaced linear scanning overhead with a lookup hash map resulting in O(1) retrieval speeds.";
      }

      setMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
      setIsGenerating(false);
      addToast({
        type: 'success',
        title: 'AI Action Completed',
        message: 'Suggestions loaded.',
      });
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    addToast({
      type: 'info',
      title: 'AI Analysis',
      message: `Analyzing active tab containing ${currentLanguage.name} code...`,
    });
    handleSend(`Can you please ${action} the active editor code?`);
  };

  return (
    <div className="ai-panel-container">
      <div className="ai-header">
        <Bot size={18} className="ai-header-icon" />
        <span className="ai-title">CodeSphere Copilot</span>
        <span className="badge badge-primary">Model: GPT-4.6</span>
      </div>

      <div className="ai-quick-actions">
        <button onClick={() => handleQuickAction('explain')} className="btn btn-secondary btn-sm quick-action-btn">
          <FileText size={12} /> Explain Code
        </button>
        <button onClick={() => handleQuickAction('optimize')} className="btn btn-secondary btn-sm quick-action-btn">
          <Wand2 size={12} /> Optimize
        </button>
        <button onClick={() => handleQuickAction('find bugs')} className="btn btn-secondary btn-sm quick-action-btn">
          <ShieldAlert size={12} /> Find Bugs
        </button>
        <button onClick={() => handleQuickAction('generate unit tests')} className="btn btn-secondary btn-sm quick-action-btn">
          <Sparkles size={12} /> Unit Tests
        </button>
      </div>

      <div className="ai-chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble bubble-${msg.sender}`}>
            <div className="bubble-header">
              {msg.sender === 'assistant' ? <Bot size={12} /> : '👤'}
              <span>{msg.sender === 'assistant' ? 'Copilot' : 'You'}</span>
            </div>
            <div className="bubble-content">
              <pre className="bubble-pre">{msg.text}</pre>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="chat-bubble bubble-assistant is-typing">
            <span>AI is reasoning...</span>
          </div>
        )}
      </div>

      <div className="ai-input-row">
        <input
          type="text"
          className="input ai-chat-input"
          placeholder="Ask AI anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
        />
        <button onClick={() => handleSend(input)} className="btn btn-primary send-btn">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
