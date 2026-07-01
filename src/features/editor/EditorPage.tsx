/* ============================================
   EditorPage.tsx — Premium Core IDE Workspace
   Integrated panels: Explorer, Monaco, Terminal, AI, Whiteboard
   ============================================ */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Bot, Terminal as TermIcon, Columns, Layout, Settings, 
  Sparkles, RefreshCw, Volume2, Mic, Video, HelpCircle, LogOut,
  FolderTree, Activity, UserCheck, Shield, ChevronLeft, ChevronRight, PenTool, CheckCircle,
  Code2, Bug, Zap, X,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useAIChatStore } from '@/stores/aiChatStore';
import FileExplorer from './FileExplorer';
import EditorTabs from './EditorTabs';
import MonacoEditorWrapper from './MonacoEditorWrapper';
import TerminalPanel from './TerminalPanel';
import OutputPanel from './OutputPanel';
import AIPanel from '../ai/AIPanel';
import WhiteboardCanvas from '../collaboration/WhiteboardCanvas';
import { useUserActivityStore } from '@/stores/userActivityStore';
import { useEditorSessionTracker } from '@/hooks/useEditorSessionTracker';
import { logCodeExecution, logUserActivity } from '@/services/dbSync';
import './EditorPage.css';

export default function EditorPage() {
  const navigate = useNavigate();
  const { incrementExecutions } = useUserActivityStore();
  const { 
    code, 
    currentLanguage, 
    setLanguage, 
    isExecuting, 
    setIsExecuting, 
    setExecutionResult, 
    addExecutionHistory, 
    showFileExplorer, 
    showTerminal, 
    showAIPanel, 
    toggleFileExplorer, 
    toggleTerminal, 
    toggleAIPanel,
    zenMode,
    toggleZenMode,
    stdin
  } = useEditorStore();

  const { openChat, setSelectedCode, selectedCode } = useAIChatStore();
  const { addToast } = useUIStore();
  const { user, logout } = useAuthStore();

  // Active coding time session tracker
  useEditorSessionTracker('main-project');

  const [activeSplit, setActiveSplit] = useState<'editor' | 'preview'>('editor');
  const [voiceActive, setVoiceActive] = useState(false);
  const [screenRecording, setScreenRecording] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  // Auto-login demo user if no auth exists
  useEffect(() => {
    if (!user) {
      addToast({
        type: 'info',
        title: 'Demo Session Created',
        message: 'Launching developer workspace environment...',
      });
    }
  }, [user, addToast]);

  const handleRunCode = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    addToast({
      type: 'info',
      title: 'Initiating Run queue',
      message: `Compiling with ${currentLanguage.name} VM...`,
    });

    // Simulate Judge0 run pipeline
    setTimeout(async () => {
      let mockStdout = `🚀 Run Result for code:\n\nHello World!\n`;
      let mockStderr = '';
      let mockExitCode = 0;

      // Extract quick outputs based on code text if present
      if (code.includes('fibonacci')) {
        mockStdout = `F(0) = 0\nF(1) = 1\nF(2) = 1\nF(3) = 2\nF(4) = 3\nF(5) = 5\nF(6) = 8\nF(7) = 13\nF(8) = 21\nF(9) = 34\n\n🚀 Happy coding with CodeSphere AI!`;
      } else if (code.includes('quicksort')) {
        mockStdout = `Original: [64, 34, 25, 12, 22, 11, 90]\nSorted:   [11, 12, 22, 25, 34, 64, 90]\n\n🚀 Happy coding with CodeSphere AI!`;
      }

      const result = {
        id: `res-${Math.random().toString(36).substring(2, 9)}`,
        stdout: mockStdout,
        stderr: mockStderr,
        status: 'Accepted',
        time: '0.08',
        memory: 2450,
        exitCode: mockExitCode,
        language: currentLanguage.id,
        timestamp: new Date().toLocaleTimeString(),
      };

      setIsExecuting(false);
      setExecutionResult(result);
      addExecutionHistory(result);
      incrementExecutions();

      if (user) {
        await logCodeExecution(user.uid, 'main-project', currentLanguage.id, 'Accepted', mockStdout, mockStderr);
        await logUserActivity(user.uid, `Ran code execution using ${currentLanguage.name}`, '▶️', 'execution');
      }

      addToast({
        type: 'success',
        title: 'Compilation Success',
        message: 'Output loaded in output panel.',
      });
    }, 1500);
  };

  const handleVoiceCommandToggle = () => {
    if (!voiceActive) {
      setVoiceActive(true);
      addToast({
        type: 'info',
        title: 'Voice Control Enabled',
        message: 'Say "Run Code" to compile or "Explain Code" to start analysis.',
      });
      // Simulate hearing command
      setTimeout(() => {
        addToast({
          type: 'success',
          title: 'Voice Command Heard',
          message: 'Received "Run Code". Launching program...',
        });
        handleRunCode();
        setVoiceActive(false);
      }, 5000);
    } else {
      setVoiceActive(false);
    }
  };

  const handleScreenRecordToggle = () => {
    if (!screenRecording) {
      setScreenRecording(true);
      addToast({
        type: 'success',
        title: 'Keystroke Replay Recording',
        message: 'Now tracking workspace inputs. Replay mode active.',
      });
    } else {
      setScreenRecording(false);
      addToast({
        type: 'info',
        title: 'Recording Complete',
        message: 'Keystroke session exported as workspace file.',
      });
    }
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'Secure session closed.',
    });
    navigate('/');
  };

  return (
    <div className={`editor-page-container ${zenMode ? 'zen-active' : ''}`}>
      {/* ============================================
          IDE TOP BAR
          ============================================ */}
      <header className="ide-top-bar glass-strong">
        <div className="top-bar-left">
          <div className="logo-badge" onClick={() => navigate('/dashboard')}>
            <Sparkles size={16} />
            <span>CodeSphere AI</span>
          </div>
          <span className="ide-workspace-title">main-workspace</span>
          
          <div className="voice-mic-trigger">
            <button 
              className={`btn btn-secondary btn-icon voice-btn ${voiceActive ? 'listening' : ''}`}
              onClick={handleVoiceCommandToggle}
              title="Voice Assist Trigger"
            >
              <Mic size={14} className={voiceActive ? 'animate-pulse' : ''} />
            </button>
            {voiceActive && <span className="listening-tag">Listening...</span>}
          </div>
        </div>

        <div className="top-bar-center">
          <button 
            className={`btn btn-secondary run-btn ${isExecuting ? 'disabled' : ''}`}
            onClick={handleRunCode}
            disabled={isExecuting}
          >
            <Play size={14} fill="currentColor" />
            <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>
          
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={handleScreenRecordToggle}
            title="Record Keystrokes/Screen"
            style={{ color: screenRecording ? 'var(--danger)' : '' }}
          >
            <Video size={14} />
          </button>

          <button 
            className={`btn btn-secondary btn-icon ${showWhiteboard ? 'active' : ''}`}
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            title="Interactive Whiteboard"
          >
            <PenTool size={14} />
          </button>
        </div>

        <div className="top-bar-right">
          <div className="ide-indicators">
            <span className="indicator-pill text-gradient">XP: 12,450</span>
            <span className="indicator-pill text-gradient">Level: 24</span>
          </div>

          <div className="ide-actions">
            <button className="btn btn-ghost btn-icon" onClick={() => navigate('/dashboard')} title="Dev Analytics">
              <Activity size={16} />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={() => navigate('/settings')} title="Settings">
              <Settings size={16} />
            </button>
            <button className="btn btn-ghost btn-icon text-danger" onClick={handleLogout} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================
          IDE WORKSPACE BODIES
          ============================================ */}
      <div className="ide-workspace-body">
        {/* Left Side Explorer */}
        {showFileExplorer && !zenMode && (
          <aside className="ide-sidebar-explorer glass">
            <FileExplorer />
          </aside>
        )}

        {/* Center Panel Container */}
        <main className="ide-center-pane">
          {/* Header tabs for current editing contexts */}
          <EditorTabs />

          {/* Editors / Live previews splits */}
          <div className="editor-main-area">
            {showWhiteboard ? (
              <WhiteboardCanvas />
            ) : (
              <MonacoEditorWrapper />
            )}
          </div>

          {/* Ask AI floating bar — appears when code is selected */}
          <AnimatePresence>
            {selectedCode && !showWhiteboard && (
              <motion.div
                className="ask-ai-bar"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <span className="ask-ai-bar-label">
                  <Code2 size={12} />
                  {selectedCode.split('\n').length} line{selectedCode.split('\n').length !== 1 ? 's' : ''} selected
                </span>
                <div className="ask-ai-bar-actions">
                  {[
                    { label: 'Explain', icon: <Code2 size={11} />, prompt: 'Explain this code:\n\n```\n' + selectedCode + '\n```' },
                    { label: 'Debug', icon: <Bug size={11} />, prompt: 'Debug and find issues in:\n\n```\n' + selectedCode + '\n```' },
                    { label: 'Optimize', icon: <Zap size={11} />, prompt: 'Optimize this code for performance:\n\n```\n' + selectedCode + '\n```' },
                  ].map(a => (
                    <button
                      key={a.label}
                      className="ask-ai-chip"
                      onClick={() => openChat(a.prompt)}
                    >
                      {a.icon} {a.label}
                    </button>
                  ))}
                  <button className="ask-ai-chip ask-ai-primary" onClick={() => openChat()}>
                    <Sparkles size={11} /> Ask AI
                  </button>
                </div>
                <button className="ask-ai-dismiss" onClick={() => setSelectedCode('')}>
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom console / Output splits */}
          {showTerminal && !zenMode && (
            <div className="ide-bottom-consoles glass">
              <TerminalPanel />
              <OutputPanel />
            </div>
          )}
        </main>

        {/* Right Side AI Panel */}
        {showAIPanel && !zenMode && (
          <aside className="ide-sidebar-ai glass">
            <AIPanel />
          </aside>
        )}
      </div>

      {/* ============================================
          IDE FOOTER STATUS BAR
          ============================================ */}
      <footer className="ide-status-bar glass-strong">
        <div className="status-bar-left">
          <button className="status-btn" onClick={toggleFileExplorer}>
            <FolderTree size={12} />
            <span>Files Explorer</span>
          </button>
          <button className="status-btn" onClick={toggleTerminal}>
            <TermIcon size={12} />
            <span>Terminals & Runners</span>
          </button>
          <button className="status-btn" onClick={toggleAIPanel}>
            <Bot size={12} />
            <span>Copilot Panel</span>
          </button>
        </div>

        <div className="status-bar-center">
          <span>Active VM Node: us-west-4.codesphere.ai</span>
        </div>

        <div className="status-bar-right">
          <button className="status-btn" onClick={toggleZenMode}>
            <span>Zen Mode</span>
          </button>
          <span className="status-detail">UTF-8</span>
          <span className="status-detail">{currentLanguage.name}</span>
          <span className="status-detail">Line 1, Col 1</span>
        </div>
      </footer>
    </div>
  );
}
export { FileExplorer, EditorTabs, MonacoEditorWrapper, TerminalPanel, OutputPanel };
