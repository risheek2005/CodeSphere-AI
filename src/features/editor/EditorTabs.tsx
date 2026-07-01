/* ============================================
   EditorTabs.tsx — Editor Top Tabs Component
   Supports active tab highlight, change tracking, and closes
   ============================================ */
import { X, Play } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useUIStore } from '@/stores/uiStore';
import { getLanguageById } from '@/utils/languages';

export default function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();
  const { addToast } = useUIStore();

  if (tabs.length === 0) {
    return (
      <div className="editor-tabs-empty">
        <span>No files open. Select a file from the explorer to begin.</span>
      </div>
    );
  }

  return (
    <div className="editor-tabs-bar">
      <div className="editor-tabs-list">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const config = getLanguageById(tab.language);

          return (
            <div 
              key={tab.id}
              className={`editor-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-lang-icon" style={{ color: config?.color }}>
                {config?.icon || '📄'}
              </span>
              <span className="tab-name">{tab.name}</span>
              {tab.isModified && <span className="tab-modified-dot" />}
              <button 
                className="tab-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
