/* ============================================
   TerminalPanel.tsx — Premium CLI Simulator
   Interactive prompt with custom commands
   ============================================ */
import { useState, useRef, useEffect } from 'react';
import { Terminal as TermIcon, Play, RefreshCw, Trash } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useUIStore } from '@/stores/uiStore';

interface HistoryItem {
  type: 'input' | 'output' | 'error';
  text: string;
}

export default function TerminalPanel() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'output', text: 'CodeSphere AI Command Line Interface v1.0.0' },
    { type: 'output', text: 'Type "help" to see available terminal triggers.' },
    { type: 'output', text: '' },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { addToast } = useUIStore();
  const { code, currentLanguage } = useEditorStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmdStr: string) => {
    const args = cmdStr.trim().split(' ');
    const cmd = args[0].toLowerCase();
    const newHistory = [...history, { type: 'input' as const, text: `$ ${cmdStr}` }];

    if (!cmd) {
      setHistory(newHistory);
      return;
    }

    switch (cmd) {
      case 'help':
        setHistory([
          ...newHistory,
          { type: 'output', text: 'Available commands:' },
          { type: 'output', text: '  help              - Show CLI details' },
          { type: 'output', text: '  clear             - Flush terminal screen' },
          { type: 'output', text: '  run               - Execute active editor program' },
          { type: 'output', text: '  git status        - Display local project tree status' },
          { type: 'output', text: '  ai <question>     - Quick query input for virtual pairing' },
          { type: 'output', text: '  voice-commands    - Log current status of PWA voice state' },
          { type: 'output', text: '  system-diagnostics - Check CPU/Memory mock utilization' },
        ]);
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'run':
        setHistory([
          ...newHistory,
          { type: 'output', text: `Invoking workspace run handler using ${currentLanguage.name}...` },
          { type: 'output', text: `Compiler: Mock Virtual Machine Active` },
          { type: 'output', text: `Stdout:` },
          { type: 'output', text: `--------------------------------------------------` },
          { type: 'output', text: `Executing sandbox environment simulation...` },
          { type: 'output', text: `Program terminated successfully.` },
        ]);
        addToast({
          type: 'success',
          title: 'Code Executed',
          message: 'Output printed to integrated console.',
        });
        break;
      case 'git':
        if (args[1] === 'status') {
          setHistory([
            ...newHistory,
            { type: 'output', text: 'On branch main' },
            { type: 'output', text: 'Your branch is up to date with \'origin/main\'.' },
            { type: 'output', text: 'Changes not staged for commit:' },
            { type: 'output', text: '  (use "git add <file>..." to update what will be committed)' },
            { type: 'output', text: '	modified:   src/main.js' },
            { type: 'output', text: 'no changes added to commit (use "git add" and/or "git commit -a")' },
          ]);
        } else {
          setHistory([
            ...newHistory,
            { type: 'error', text: `Git arguments error: "${args.slice(1).join(' ')}" not implemented.` },
          ]);
        }
        break;
      case 'ai':
        const query = args.slice(1).join(' ');
        if (!query) {
          setHistory([...newHistory, { type: 'error', text: 'Please specify a prompt. e.g. "ai explain this"' }]);
        } else {
          setHistory([
            ...newHistory,
            { type: 'output', text: `🤖 Assistant response: Let's optimize this code. We should minimize memory footprints by caching repeated recursive computations.` }
          ]);
        }
        break;
      case 'system-diagnostics':
        setHistory([
          ...newHistory,
          { type: 'output', text: 'SYSTEM STATS:' },
          { type: 'output', text: '  - Core Engine: React 19 / Monaco 0.49' },
          { type: 'output', text: '  - Active Threads: 4 Sandboxed Worker Pools' },
          { type: 'output', text: '  - Frame rate: 60 FPS (GPU rendering active)' },
          { type: 'output', text: '  - WebSocket Connection: connected to virtual proxy' },
        ]);
        break;
      case 'voice-commands':
        setHistory([
          ...newHistory,
          { type: 'output', text: 'Voice Assist Module: Standby' },
          { type: 'output', text: 'Trigger phrases: "Run code", "Explain this", "Create file"' },
        ]);
        break;
      default:
        setHistory([
          ...newHistory,
          { type: 'error', text: `Command not found: "${cmd}". Type "help" for a list of available actions.` },
        ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div className="terminal-panel-container">
      <div className="terminal-header">
        <div className="terminal-header-title">
          <TermIcon size={14} />
          <span>Integrated Terminal (Zsh)</span>
        </div>
        <div className="terminal-header-actions">
          <button onClick={() => setHistory([])} title="Clear Screen">
            <Trash size={13} />
          </button>
        </div>
      </div>
      
      <div className="terminal-logs">
        {history.map((item, index) => (
          <div key={index} className={`terminal-line line-${item.type}`}>
            {item.text}
          </div>
        ))}
        <div className="terminal-input-row">
          <span className="terminal-prompt">$</span>
          <input
            type="text"
            className="terminal-cmd-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command here..."
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
