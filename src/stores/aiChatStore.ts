/* ============================================
   AI Chat Store — per-session history, streaming state
   Connected to Firestore DB for isolated user storage.
   ============================================ */
import { create } from 'zustand';
import { getDocument, setDocument } from '@/services/firebase';

export type QuickActionType =
  | 'explain' | 'debug' | 'optimize' | 'docs'
  | 'tests' | 'refactor' | 'translate' | 'general';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
}

const DEFAULT_SESSION = 'global';

interface AIChatState {
  isOpen: boolean;
  activeSessionId: string;
  sessions: Record<string, ChatSession>;
  isGenerating: boolean;
  selectedCode: string;       // code selected in Monaco editor
  pendingInput: string;       // pre-fill for next message

  /* panel controls */
  openChat: (prefill?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;

  /* selection */
  setSelectedCode: (code: string) => void;
  setPendingInput: (val: string) => void;

  /* session management */
  setActiveSession: (id: string) => void;
  ensureSession: (id: string, name?: string) => void;

  /* message flow */
  addUserMessage: (content: string, sessionId?: string) => void;
  startAssistantMessage: (sessionId?: string) => string;   // returns msgId
  appendToMessage: (msgId: string, chunk: string, sessionId?: string) => void;
  finalizeMessage: (msgId: string, sessionId?: string) => void;
  setGenerating: (val: boolean) => void;
  clearSession: (sessionId?: string) => void;

  /* Firestore Persistance Actions */
  loadUserChats: (userId: string) => Promise<void>;
  saveUserChats: (userId: string) => Promise<void>;
}

export const useAIChatStore = create<AIChatState>()((set, get) => ({
  isOpen: false,
  activeSessionId: DEFAULT_SESSION,
  sessions: {
    [DEFAULT_SESSION]: {
      id: DEFAULT_SESSION,
      name: 'General',
      messages: [],
      createdAt: Date.now(),
    },
  },
  isGenerating: false,
  selectedCode: '',
  pendingInput: '',

  openChat: (prefill) => set({ isOpen: true, ...(prefill ? { pendingInput: prefill } : {}) }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),

  setSelectedCode: (code) => set({ selectedCode: code }),
  setPendingInput: (val) => set({ pendingInput: val }),

  setActiveSession: (id) => set({ activeSessionId: id }),

  ensureSession: (id, name) => {
    if (!get().sessions[id]) {
      set((s) => ({
        sessions: {
          ...s.sessions,
          [id]: { id, name: name ?? id, messages: [], createdAt: Date.now() },
        },
      }));
    }
  },

  addUserMessage: (content, sessionId) => {
    const sid = sessionId ?? get().activeSessionId;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    set((s) => ({
      sessions: {
        ...s.sessions,
        [sid]: {
          ...s.sessions[sid],
          messages: [...(s.sessions[sid]?.messages ?? []), msg],
        },
      },
    }));
  },

  startAssistantMessage: (sessionId) => {
    const sid = sessionId ?? get().activeSessionId;
    const id = `msg-${Date.now()}-a`;
    const msg: ChatMessage = {
      id,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    set((s) => ({
      sessions: {
        ...s.sessions,
        [sid]: {
          ...s.sessions[sid],
          messages: [...(s.sessions[sid]?.messages ?? []), msg],
        },
      },
    }));
    return id;
  },

  appendToMessage: (msgId, chunk, sessionId) => {
    const sid = sessionId ?? get().activeSessionId;
    set((s) => {
      const session = s.sessions[sid];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sid]: {
            ...session,
            messages: session.messages.map((m) =>
              m.id === msgId ? { ...m, content: m.content + chunk } : m,
            ),
          },
        },
      };
    });
  },

  finalizeMessage: (msgId, sessionId) => {
    const sid = sessionId ?? get().activeSessionId;
    set((s) => {
      const session = s.sessions[sid];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sid]: {
            ...session,
            messages: session.messages.map((m) =>
              m.id === msgId ? { ...m, isStreaming: false } : m,
            ),
          },
        },
      };
    });
  },

  setGenerating: (val) => set({ isGenerating: val }),

  clearSession: (sessionId) => {
    const sid = sessionId ?? get().activeSessionId;
    set((s) => ({
      sessions: {
        ...s.sessions,
        [sid]: { ...s.sessions[sid], messages: [] },
      },
    }));
  },

  loadUserChats: async (userId) => {
    try {
      const data = await getDocument<{ sessions: any; activeSessionId: string }>('AIChats', userId);
      if (data) {
        set({
          sessions: data.sessions || {},
          activeSessionId: data.activeSessionId || DEFAULT_SESSION
        });
      } else {
        // Reset to initial general chat
        set({
          sessions: {
            [DEFAULT_SESSION]: {
              id: DEFAULT_SESSION,
              name: 'General',
              messages: [],
              createdAt: Date.now(),
            },
          },
          activeSessionId: DEFAULT_SESSION
        });
      }
    } catch (e) {
      console.error("Failed to load user chats from DB:", e);
    }
  },

  saveUserChats: async (userId) => {
    try {
      await setDocument('AIChats', userId, {
        sessions: get().sessions,
        activeSessionId: get().activeSessionId
      });
    } catch (e) {
      console.error("Failed to save user chats to DB:", e);
    }
  }
}));
