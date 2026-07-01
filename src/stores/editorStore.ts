/* ============================================
   Editor Store — Zustand state management
   Manages editor tabs, files, settings, and execution state
   Auto-saves and persists workspaces to Firestore/simulated DB.
   ============================================ */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { languages, type LanguageConfig } from '@/utils/languages';
import { saveUserProject, loadUserProjects } from '@/services/dbSync';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  isModified?: boolean;
}

export interface EditorTab {
  id: string;
  name: string;
  language: string;
  content: string;
  isModified: boolean;
  cursorPosition: { line: number; column: number };
}

interface ExecutionResult {
  id: string;
  stdout: string;
  stderr: string;
  status: string;
  time: string;
  memory: number;
  exitCode: number;
  language: string;
  timestamp: string;
}

interface EditorState {
  /* ---- Tabs ---- */
  tabs: EditorTab[];
  activeTabId: string | null;
  addTab: (tab: Omit<EditorTab, 'isModified' | 'cursorPosition'>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;

  /* ---- Language ---- */
  currentLanguage: LanguageConfig;
  setLanguage: (langId: string) => void;

  /* ---- Code ---- */
  code: string;
  setCode: (code: string) => void;

  /* ---- Execution ---- */
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  executionHistory: ExecutionResult[];
  stdin: string;
  setIsExecuting: (val: boolean) => void;
  setExecutionResult: (result: ExecutionResult | null) => void;
  addExecutionHistory: (result: ExecutionResult) => void;
  setStdin: (val: string) => void;

  /* ---- Settings ---- */
  fontSize: number;
  theme: string;
  minimap: boolean;
  wordWrap: 'on' | 'off';
  vimMode: boolean;
  autoSave: boolean;
  setFontSize: (size: number) => void;
  setTheme: (theme: string) => void;
  toggleMinimap: () => void;
  toggleWordWrap: () => void;
  toggleVimMode: () => void;
  toggleAutoSave: () => void;

  /* ---- Panels ---- */
  showTerminal: boolean;
  showFileExplorer: boolean;
  showAIPanel: boolean;
  zenMode: boolean;
  toggleTerminal: () => void;
  toggleFileExplorer: () => void;
  toggleAIPanel: () => void;
  toggleZenMode: () => void;

  /* ---- File Tree ---- */
  fileTree: FileNode[];
  setFileTree: (tree: FileNode[]) => void;

  /* ---- Workspace Database sync ---- */
  loadWorkspace: (userId: string) => Promise<void>;
  saveWorkspace: (userId: string) => Promise<void>;
}

const defaultLang = languages.javascript;

const DEFAULT_FILE_TREE: FileNode[] = [
  {
    id: 'root',
    name: 'codesphere-project',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'src', name: 'src', type: 'folder', isOpen: true,
        children: [
          { id: 'main-js', name: 'main.js', type: 'file', language: 'javascript', content: defaultLang.defaultCode },
          { id: 'utils-py', name: 'utils.py', type: 'file', language: 'python', content: languages.python.defaultCode },
          { id: 'styles', name: 'styles.css', type: 'file', language: 'css', content: languages.css.defaultCode },
        ],
      },
      {
        id: 'tests', name: 'tests', type: 'folder', isOpen: false,
        children: [
          { id: 'test-js', name: 'test.js', type: 'file', language: 'javascript', content: '// Test file\nconsole.log("Tests running...");' },
        ],
      },
      { id: 'readme', name: 'README.md', type: 'file', language: 'markdown', content: languages.markdown.defaultCode },
      { id: 'package', name: 'package.json', type: 'file', language: 'json', content: languages.json.defaultCode },
    ],
  },
];

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      /* ---- Tabs ---- */
      tabs: [
        {
          id: 'default',
          name: `main${defaultLang.extension}`,
          language: defaultLang.id,
          content: defaultLang.defaultCode,
          isModified: false,
          cursorPosition: { line: 1, column: 1 },
        },
      ],
      activeTabId: 'default',
      addTab: (tab) => {
        const existing = get().tabs.find((t) => t.id === tab.id);
        if (existing) {
          set({ activeTabId: tab.id });
          return;
        }
        set((s) => ({
          tabs: [...s.tabs, { ...tab, isModified: false, cursorPosition: { line: 1, column: 1 } }],
          activeTabId: tab.id,
        }));
      },
      closeTab: (id) =>
        set((s) => {
          const filtered = s.tabs.filter((t) => t.id !== id);
          const newActive =
            s.activeTabId === id
              ? filtered.length > 0
                ? filtered[filtered.length - 1].id
                : null
              : s.activeTabId;
          return { tabs: filtered, activeTabId: newActive };
        }),
      setActiveTab: (id) => set({ activeTabId: id }),
      updateTabContent: (id, content) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, content, isModified: true } : t)),
        })),

      /* ---- Language ---- */
      currentLanguage: defaultLang,
      setLanguage: (langId) => {
        const lang = languages[langId] || defaultLang;
        set({ currentLanguage: lang, code: lang.defaultCode });
      },

      /* ---- Code ---- */
      code: defaultLang.defaultCode,
      setCode: (code) => set({ code }),

      /* ---- Execution ---- */
      isExecuting: false,
      executionResult: null,
      executionHistory: [],
      stdin: '',
      setIsExecuting: (val) => set({ isExecuting: val }),
      setExecutionResult: (result) => set({ executionResult: result }),
      addExecutionHistory: (result) =>
        set((s) => ({ executionHistory: [result, ...s.executionHistory].slice(0, 50) })),
      setStdin: (val) => set({ stdin: val }),

      /* ---- Settings ---- */
      fontSize: 14,
      theme: 'vs-dark',
      minimap: true,
      wordWrap: 'off',
      vimMode: false,
      autoSave: true,
      setFontSize: (size) => set({ fontSize: size }),
      setTheme: (theme) => set({ theme }),
      toggleMinimap: () => set((s) => ({ minimap: !s.minimap })),
      toggleWordWrap: () => set((s) => ({ wordWrap: s.wordWrap === 'on' ? 'off' : 'on' })),
      toggleVimMode: () => set((s) => ({ vimMode: !s.vimMode })),
      toggleAutoSave: () => set((s) => ({ autoSave: !s.autoSave })),

      /* ---- Panels ---- */
      showTerminal: true,
      showFileExplorer: true,
      showAIPanel: false,
      zenMode: false,
      toggleTerminal: () => set((s) => ({ showTerminal: !s.showTerminal })),
      toggleFileExplorer: () => set((s) => ({ showFileExplorer: !s.showFileExplorer })),
      toggleAIPanel: () => set((s) => ({ showAIPanel: !s.showAIPanel })),
      toggleZenMode: () => set((s) => ({ zenMode: !s.zenMode })),

      /* ---- File Tree ---- */
      fileTree: DEFAULT_FILE_TREE,
      setFileTree: (tree) => set({ fileTree: tree }),

      /* ---- Workspace DB Sync ---- */
      loadWorkspace: async (userId) => {
        try {
          const projects = await loadUserProjects(userId);
          if (projects && projects.length > 0) {
            // Find most recently modified project
            const activeProj = projects.sort((a, b) => b.lastModified - a.lastModified)[0];
            set({
              fileTree: activeProj.fileTree || DEFAULT_FILE_TREE,
              tabs: activeProj.tabs || [],
              activeTabId: activeProj.activeTabId || null,
            });
          } else {
            // New user, create initial default project in DB
            const initialProj = {
              id: 'main-project',
              name: 'codesphere-project',
              createdAt: Date.now(),
              lastModified: Date.now(),
              language: 'javascript',
              fileTree: DEFAULT_FILE_TREE,
              tabs: [
                {
                  id: 'default',
                  name: `main${defaultLang.extension}`,
                  language: defaultLang.id,
                  content: defaultLang.defaultCode,
                  isModified: false,
                  cursorPosition: { line: 1, column: 1 },
                }
              ],
              activeTabId: 'default'
            };
            await saveUserProject(userId, initialProj);
            set({
              fileTree: DEFAULT_FILE_TREE,
              tabs: initialProj.tabs,
              activeTabId: 'default',
            });
          }
        } catch (e) {
          console.error("Failed to load user workspace:", e);
        }
      },

      saveWorkspace: async (userId) => {
        try {
          const proj = {
            id: 'main-project',
            name: 'codesphere-project',
            createdAt: Date.now(),
            lastModified: Date.now(),
            language: get().currentLanguage.id,
            fileTree: get().fileTree,
            tabs: get().tabs,
            activeTabId: get().activeTabId,
          };
          await saveUserProject(userId, proj);
        } catch (e) {
          console.error("Failed to auto-save workspace:", e);
        }
      }
    }),
    {
      name: 'codesphere-editor',
      partialize: (state) => ({
        fontSize: state.fontSize,
        theme: state.theme,
        minimap: state.minimap,
        wordWrap: state.wordWrap,
        vimMode: state.vimMode,
        autoSave: state.autoSave,
        currentLanguage: state.currentLanguage,
      }),
    },
  ),
);
export const loader = undefined; // satisfy index.html loader refs if any
