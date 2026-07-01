/* ============================================
   GlobalAIAssistant.tsx — Floating button + Cursor-style sidebar
   Persistent on every page. Glassmorphism dark theme.
   ============================================ */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, X, Send, Trash2, ChevronRight, Code2, Bug, Zap,
  FileText, FlaskConical, RefreshCw, Languages, Sparkles,
  Copy, Check, ChevronDown, Plus, Minimize2,
} from 'lucide-react';
import { useAIChatStore, type QuickActionType } from '@/stores/aiChatStore';
import { streamAIResponse, type AIMessage } from '@/services/aiService';
import { useUserActivityStore } from '@/stores/userActivityStore';
import { useAuthStore } from '@/stores/authStore';
import { MessageRenderer } from './MessageRenderer';
import './GlobalAIAssistant.css';

/* ---- Quick action definitions ---- */
const QUICK_ACTIONS: { id: QuickActionType; label: string; icon: React.ReactNode; prompt: string }[] = [
  { id: 'explain',  label: 'Explain',   icon: <Code2 size={13} />,       prompt: 'Explain this code step by step:' },
  { id: 'debug',    label: 'Debug',     icon: <Bug size={13} />,         prompt: 'Find bugs and issues in this code:' },
  { id: 'optimize', label: 'Optimize',  icon: <Zap size={13} />,         prompt: 'Optimize this code for performance:' },
  { id: 'docs',     label: 'Docs',      icon: <FileText size={13} />,    prompt: 'Generate documentation for this code:' },
  { id: 'tests',    label: 'Tests',     icon: <FlaskConical size={13} />, prompt: 'Write comprehensive unit tests for:' },
  { id: 'refactor', label: 'Refactor',  icon: <RefreshCw size={13} />,   prompt: 'Refactor and improve this code:' },
  { id: 'translate',label: 'Translate', icon: <Languages size={13} />,   prompt: 'Translate this code to another language:' },
];

const SYSTEM_PROMPT = `You are CodeSphere AI Copilot — an elite AI pair programmer embedded in the CodeSphere AI cloud IDE. You are precise, insightful, and professional.

When answering:
- Use markdown formatting with code blocks (always specify language)
- Be concise but thorough
- Offer specific, actionable suggestions
- For code questions, always show before/after examples
- Mention time/space complexity when relevant

You support: JavaScript, TypeScript, Python, Rust, Go, C++, Java, SQL, and more.`;

/* ---- Copy button for code blocks ---- */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="copy-btn" onClick={copy} title="Copy">
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

/* ---- Individual message bubble ---- */
function MessageBubble({ role, content, isStreaming }: { role: 'user' | 'assistant'; content: string; isStreaming?: boolean }) {
  return (
    <motion.div
      className={`chat-message ${role}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {role === 'assistant' && (
        <div className="ai-avatar">
          <Bot size={14} />
        </div>
      )}
      <div className="message-content">
        {role === 'user' ? (
          <p className="user-text">{content}</p>
        ) : (
          <MessageRenderer content={content} />
        )}
        {isStreaming && <span className="streaming-cursor" aria-hidden />}
      </div>
    </motion.div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function GlobalAIAssistant() {
  const {
    isOpen, isGenerating, selectedCode, pendingInput,
    sessions, activeSessionId,
    openChat, closeChat, toggleChat,
    addUserMessage, startAssistantMessage, appendToMessage, finalizeMessage,
    setGenerating, clearSession, setPendingInput, setSelectedCode,
    saveUserChats,
  } = useAIChatStore();

  const { user } = useAuthStore();
  const { incrementAiQueries } = useUserActivityStore();

  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<boolean>(false);

  const currentSession = sessions[activeSessionId];
  const messages = currentSession?.messages ?? [];

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  /* Consume pendingInput when chat opens */
  useEffect(() => {
    if (isOpen && pendingInput) {
      setInput(pendingInput);
      setPendingInput('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, pendingInput, setPendingInput]);

  /* Focus input on open */
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  /* Build message history for API */
  const buildHistory = useCallback((): AIMessage[] => {
    const history: AIMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }];
    messages.slice(-20).forEach(m => {
      if (!m.isStreaming) {
        history.push({ role: m.role, content: m.content });
      }
    });
    return history;
  }, [messages]);

  /* Send message */
  const handleSend = useCallback(async (messageContent?: string) => {
    const text = (messageContent ?? input).trim();
    if (!text || isGenerating) return;

    setInput('');
    setSelectedCode('');
    addUserMessage(text);
    incrementAiQueries();
    if (user) saveUserChats(user.uid);

    const history = buildHistory();
    history.push({ role: 'user', content: text });

    setGenerating(true);
    abortRef.current = false;
    const msgId = startAssistantMessage();

    await streamAIResponse(history, {
      onChunk: (chunk) => {
        if (abortRef.current) return;
        appendToMessage(msgId, chunk);
      },
      onComplete: () => {
        finalizeMessage(msgId);
        setGenerating(false);
        if (user) saveUserChats(user.uid);
      },
      onError: (err) => {
        appendToMessage(msgId, `\n\n*Error: ${err}*`);
        finalizeMessage(msgId);
        setGenerating(false);
        if (user) saveUserChats(user.uid);
      },
    });
  }, [input, isGenerating, buildHistory, addUserMessage, startAssistantMessage, appendToMessage, finalizeMessage, setGenerating, setSelectedCode, incrementAiQueries, user, saveUserChats]);

  /* Quick action trigger */
  const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[0]) => {
    const code = selectedCode.trim();
    const message = code
      ? `${action.prompt}\n\n\`\`\`\n${code}\n\`\`\``
      : `${action.prompt} (no code selected — give a general example)`;
    handleSend(message);
  }, [selectedCode, handleSend]);

  /* Keyboard shortcuts */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Stop generation */
  const handleStop = () => {
    abortRef.current = true;
    setGenerating(false);
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.isStreaming) {
      finalizeMessage(lastMsg.id);
    }
  };

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="ai-fab"
            onClick={() => openChat()}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            title="Open CodeSphere AI"
            aria-label="Open AI Assistant"
          >
            <Sparkles size={20} />
            <span className="fab-label">AI</span>
            {isGenerating && <span className="fab-pulse" />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className={`ai-sidebar ${isMinimized ? 'minimized' : ''}`}
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            aria-label="AI Assistant"
          >
            {/* Header */}
            <div className="sidebar-header">
              <div className="sidebar-title">
                <div className="ai-logo-dot" />
                <span>CodeSphere AI</span>
                {isGenerating && <span className="generating-badge">Thinking…</span>}
              </div>
              <div className="sidebar-header-actions">
                <button
                  className="sidebar-icon-btn"
                  onClick={() => {
                    clearSession();
                    if (user) saveUserChats(user.uid);
                  }}
                  title="Clear chat"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  className="sidebar-icon-btn"
                  onClick={() => setIsMinimized(v => !v)}
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  <Minimize2 size={14} />
                </button>
                <button
                  className="sidebar-icon-btn sidebar-close"
                  onClick={closeChat}
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Quick Actions */}
                <div className="quick-actions-bar">
                  <span className="qa-label">Quick:</span>
                  <div className="qa-chips">
                    {QUICK_ACTIONS.map(a => (
                      <button
                        key={a.id}
                        className="qa-chip"
                        onClick={() => handleQuickAction(a)}
                        disabled={isGenerating}
                        title={selectedCode ? `${a.label} selected code` : `${a.label} (no code selected)`}
                      >
                        {a.icon}
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected code banner */}
                <AnimatePresence>
                  {selectedCode && (
                    <motion.div
                      className="selected-code-banner"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <Code2 size={12} />
                      <span className="selected-code-preview">
                        {selectedCode.slice(0, 80)}{selectedCode.length > 80 ? '…' : ''}
                      </span>
                      <button onClick={() => setSelectedCode('')} className="deselect-btn">
                        <X size={10} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages */}
                <div className="messages-area">
                  {messages.length === 0 ? (
                    <div className="empty-chat">
                      <div className="empty-chat-icon">
                        <Bot size={28} />
                      </div>
                      <h3>CodeSphere AI Copilot</h3>
                      <p>Your intelligent pair programmer. Ask anything, or select code in the editor and use the quick actions above.</p>
                      <div className="empty-hints">
                        <span>💡 "Explain how useCallback works"</span>
                        <span>🐛 "Why is my async function leaking?"</span>
                        <span>⚡ "Optimize this O(n²) algorithm"</span>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <MessageBubble
                        key={msg.id}
                        role={msg.role}
                        content={msg.content}
                        isStreaming={msg.isStreaming}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-area">
                  {isGenerating && (
                    <button className="stop-btn" onClick={handleStop}>
                      <X size={12} /> Stop
                    </button>
                  )}
                  <div className="chat-input-row">
                    <textarea
                      ref={inputRef}
                      className="chat-input"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={selectedCode ? 'Ask about the selected code…' : 'Ask CodeSphere AI anything…'}
                      rows={1}
                      disabled={isGenerating}
                    />
                    <button
                      className="send-btn"
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isGenerating}
                      title="Send (Enter)"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                  <p className="input-hint">Enter to send · Shift+Enter for newline</p>
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
