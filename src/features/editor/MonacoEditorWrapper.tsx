/* ============================================
   MonacoEditorWrapper.tsx — Monaco Editor Integration
   Loads monaco, sets custom VS-Dark theme, updates state
   Tracks code selection → feeds to AI sidebar
   ============================================ */
import { useEffect, useRef } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';
import { useEditorStore } from '@/stores/editorStore';
import { useAIChatStore } from '@/stores/aiChatStore';
import { getLanguageById } from '@/utils/languages';

export default function MonacoEditorWrapper() {
  const { 
    tabs, 
    activeTabId, 
    updateTabContent, 
    fontSize, 
    minimap, 
    wordWrap,
    code,
    setCode
  } = useEditorStore();

  const { setSelectedCode } = useAIChatStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const editorRef = useRef<any>(null);

  // Sync tab content changes to the active global content state
  useEffect(() => {
    if (activeTab) {
      setCode(activeTab.content);
    }
  }, [activeTabId, activeTab, setCode]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeTabId) {
      updateTabContent(activeTabId, value);
      setCode(value);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Custom Cosmic dark editor styling injection
    monaco.editor.defineTheme('cosmic-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
        { token: 'keyword', foreground: '8B5CF6', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'F1F5F9' },
        { token: 'string', foreground: '10B981' },
        { token: 'number', foreground: '06B6D4' },
      ],
      colors: {
        'editor.background': '#05081600',
        'editor.foreground': '#F1F5F9',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#6366F1',
        'editor.lineHighlightBackground': '#6366F108',
        'editor.selectionBackground': '#6366F130',
      },
    });

    monaco.editor.setTheme('cosmic-dark');

    // Track selected code → expose to Global AI Assistant
    editor.onDidChangeCursorSelection(() => {
      const model = editor.getModel();
      if (!model) return;
      const selection = editor.getSelection();
      if (!selection || selection.isEmpty()) {
        setSelectedCode('');
        return;
      }
      const selectedText = model.getValueInRange(selection);
      setSelectedCode(selectedText.trim());
    });
  };

  if (!activeTab) {
    return (
      <div className="editor-fallback flex-center">
        <p>Choose or create a file to start editing.</p>
      </div>
    );
  }

  const langConfig = getLanguageById(activeTab.language);

  return (
    <div className="monaco-wrapper">
      <MonacoEditor
        height="100%"
        language={langConfig?.monacoLang || 'javascript'}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={<div className="monaco-loading">Preparing Editor...</div>}
        options={{
          fontSize: fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: minimap },
          wordWrap: wordWrap,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 12 },
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}
export { loader };
