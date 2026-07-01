/* ============================================
   SettingsPage.tsx — Premium Preferences Panel
   Configure Editor fonts, Vim options, themes, PWA offline state
   ============================================ */
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, Sliders, Eye, ToggleLeft, ArrowLeft } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useUIStore } from '@/stores/uiStore';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  
  const {
    fontSize, setFontSize,
    theme, setTheme,
    minimap, toggleMinimap,
    wordWrap, toggleWordWrap,
    vimMode, toggleVimMode,
    autoSave, toggleAutoSave
  } = useEditorStore();

  const handleSaveSettings = () => {
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Workspace configurations loaded.',
    });
    navigate('/editor');
  };

  return (
    <div className="settings-container">
      <header className="settings-nav glass-strong">
        <div className="set-nav-left" onClick={() => navigate('/editor')}>
          <ArrowLeft size={16} />
          <span>Back to Editor</span>
        </div>
        <div className="set-nav-right">
          <button className="btn btn-primary btn-sm" onClick={handleSaveSettings}>
            <Save size={14} /> Save Preferences
          </button>
        </div>
      </header>

      <main className="settings-content container-sm">
        <section className="settings-welcome">
          <h1>Workspace Settings</h1>
          <p>Modify editor configs, formatting options, and local system presets.</p>
        </section>

        <div className="settings-card glass-card">
          <div className="settings-section">
            <h3>Editor Settings</h3>
            
            <div className="setting-row">
              <div className="setting-info">
                <label>Font Size</label>
                <span>Change Monaco editor typing size</span>
              </div>
              <input
                type="number"
                min="10"
                max="24"
                className="input setting-input-number"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              />
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <label>Code Theme</label>
                <span>Select visual code compiler template colors</span>
              </div>
              <select
                className="input setting-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="vs-dark">Cosmic Glow Dark</option>
                <option value="light">Classic Clean Light</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>Visual Enhancements</h3>

            <div className="setting-row-toggle">
              <div className="setting-info">
                <label>Enable Minimap</label>
                <span>Draw outline minimap on right side</span>
              </div>
              <input
                type="checkbox"
                checked={minimap}
                onChange={toggleMinimap}
                className="setting-checkbox"
              />
            </div>

            <div className="setting-row-toggle">
              <div className="setting-info">
                <label>Word Wrapping</label>
                <span>Wrap overflow code to next line automatically</span>
              </div>
              <input
                type="checkbox"
                checked={wordWrap === 'on'}
                onChange={toggleWordWrap}
                className="setting-checkbox"
              />
            </div>

            <div className="setting-row-toggle">
              <div className="setting-info">
                <label>Auto-Save Code Changes</label>
                <span>Persist code configurations automatically to local storage</span>
              </div>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={toggleAutoSave}
                className="setting-checkbox"
              />
            </div>

            <div className="setting-row-toggle">
              <div className="setting-info">
                <label>Vim Keybinding Mode</label>
                <span>Use keyboard shortcuts for workspace runs</span>
              </div>
              <input
                type="checkbox"
                checked={vimMode}
                onChange={toggleVimMode}
                className="setting-checkbox"
              />
            </div>
          </div>

          <div className="settings-section">
            <h3>PWA & Offline Integration</h3>
            <div className="setting-row">
              <div className="setting-info">
                <label>Background Synchronization</label>
                <span>Automatically sync offline changes when network restores</span>
              </div>
              <span className="badge badge-success">Always Enabled</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
