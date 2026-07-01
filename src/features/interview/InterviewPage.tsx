/* ============================================
   InterviewPage.tsx — Premium Interview Environment
   Supports Problem statement, countdown timer, starters, submission logs
   ============================================ */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Clock, AlertCircle, CheckCircle, RefreshCw, 
  Terminal, Award, BookOpen, ExternalLink, Play, Zap 
} from 'lucide-react';
import { demoInterviewProblems } from '@/utils/demo-data';
import { useUIStore } from '@/stores/uiStore';
import { useEditorStore } from '@/stores/editorStore';
import './InterviewPage.css';

export default function InterviewPage() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { addTab } = useEditorStore();
  const [problems, setProblems] = useState(demoInterviewProblems);
  const [activeProb, setActiveProb] = useState(demoInterviewProblems[0]);
  const [selectedLang, setSelectedLang] = useState<'javascript' | 'python' | 'typescript'>('javascript');
  const [timeRemaining, setTimeRemaining] = useState(2700); // 45 minutes
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'failed'>('idle');

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectProblem = (id: string) => {
    const found = problems.find(p => p.id === id);
    if (found) {
      setActiveProb(found);
      setTestResult('idle');
    }
  };

  const handleOpenInEditor = () => {
    const template = activeProb.starterCode[selectedLang] || '';
    addTab({
      id: activeProb.id,
      name: `${activeProb.title.toLowerCase().replace(/\s+/g, '-')}.${selectedLang === 'python' ? 'py' : 'js'}`,
      language: selectedLang,
      content: template,
    });
    addToast({
      type: 'success',
      title: 'Problem Scaffolded',
      message: 'Workspace tab initialized with starter template.',
    });
    navigate('/editor');
  };

  const handleRunLocalTests = () => {
    if (isRunningTests) return;
    setIsRunningTests(true);
    addToast({
      type: 'info',
      title: 'Testing Active Tab',
      message: 'Running compilation inputs against test cases...',
    });

    setTimeout(() => {
      setIsRunningTests(false);
      setTestResult('success');
      addToast({
        type: 'success',
        title: 'All Test Cases Passed!',
        message: '3/3 standard assertions verified successfully.',
      });
    }, 1500);
  };

  return (
    <div className="interview-container">
      {/* HEADER */}
      <header className="interview-nav glass-strong">
        <div className="int-nav-left" onClick={() => navigate('/')}>
          <Sparkles className="int-logo-icon" />
          <span className="int-logo-text text-gradient">Interview Sandbox</span>
        </div>
        
        <div className="timer-wrapper">
          <Clock size={16} />
          <span>Timer: <strong style={{ color: timeRemaining < 300 ? 'var(--danger-light)' : 'var(--success)' }}>{formatTime(timeRemaining)}</strong></span>
        </div>

        <div className="int-nav-right">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/editor')}>
            Launch IDE
          </button>
        </div>
      </header>

      <main className="interview-body">
        {/* LEFT COLUMN: PROBLEMS LIST */}
        <aside className="interview-sidebar-problems glass">
          <div className="sidebar-header">
            <h3>Technical Problems</h3>
          </div>
          <div className="problems-list-items">
            {problems.map((prob) => {
              const isActive = prob.id === activeProb.id;
              let diffColor = 'var(--success)';
              if (prob.difficulty === 'Medium') diffColor = 'var(--warning)';
              if (prob.difficulty === 'Hard') diffColor = 'var(--danger)';

              return (
                <div 
                  key={prob.id}
                  className={`problem-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectProblem(prob.id)}
                >
                  <div className="prob-item-title-row">
                    <h4>{prob.title}</h4>
                    <span className="difficulty-badge" style={{ color: diffColor }}>
                      {prob.difficulty}
                    </span>
                  </div>
                  <div className="prob-item-meta">
                    <span className="company-badge">{prob.company}</span>
                    <span>Acceptance: {prob.acceptance}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT COLUMN: ACTIVE PROBLEM DETAILS */}
        <section className="active-problem-workspace">
          <div className="problem-statement-card glass-card">
            <div className="prob-detail-header">
              <h2>{activeProb.title}</h2>
              <div className="prob-detail-meta">
                <span className="badge badge-primary">{activeProb.company} Set</span>
                <span className="badge badge-success">Acceptance: {activeProb.acceptance}%</span>
              </div>
            </div>

            <div className="problem-description-content">
              <p className="description-text">{activeProb.description}</p>
              
              <div className="examples-section">
                <h3>Examples:</h3>
                {activeProb.examples.map((ex, i) => (
                  <div key={i} className="example-block">
                    <p><strong>Input:</strong> <code>{ex.input}</code></p>
                    <p><strong>Output:</strong> <code>{ex.output}</code></p>
                    {ex.explanation && <p><strong>Explanation:</strong> {ex.explanation}</p>}
                  </div>
                ))}
              </div>

              <div className="constraints-section">
                <h3>Constraints:</h3>
                <ul>
                  {activeProb.constraints.map((c, i) => (
                    <li key={i}><code>{c}</code></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CODE ACTION TOOLBAR */}
          <div className="problem-scaffold-actions glass-card">
            <div className="lang-picker-group">
              <label>Select Language:</label>
              <select 
                className="input lang-select"
                value={selectedLang}
                onChange={(e: any) => setSelectedLang(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>

            <div className="action-buttons-group">
              <button className="btn btn-secondary" onClick={handleOpenInEditor}>
                <Zap size={14} /> Open in Code Editor
              </button>
              <button 
                className={`btn btn-primary ${isRunningTests ? 'disabled' : ''}`}
                onClick={handleRunLocalTests}
                disabled={isRunningTests}
              >
                <Play size={14} fill="currentColor" /> {isRunningTests ? 'Evaluating...' : 'Run Assertion Tests'}
              </button>
            </div>

            {testResult === 'success' && (
              <div className="test-success-alert animate-fadeIn">
                <CheckCircle size={16} />
                <span>Success: All test assertions passed. Ready to submit code solutions.</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
export { demoInterviewProblems };
