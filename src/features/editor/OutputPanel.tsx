/* ============================================
   OutputPanel.tsx — Compilation and Execution Panel
   Displays stdout, stderr, run metrics from Judge0 API
   ============================================ */
import { Terminal, Download, Cpu, Play } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useUIStore } from '@/stores/uiStore';

export default function OutputPanel() {
  const { executionResult, isExecuting, stdin, setStdin, currentLanguage } = useEditorStore();
  const { addToast } = useUIStore();

  const handleDownload = () => {
    if (!executionResult) return;
    const element = document.createElement("a");
    const file = new Blob([executionResult.stdout || ''], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "execution_output.txt";
    document.body.appendChild(element);
    element.click();
    addToast({
      type: 'success',
      title: 'Download Initiated',
      message: 'Output text saved.',
    });
  };

  return (
    <div className="output-panel-container">
      <div className="output-header">
        <div className="output-title">
          <Terminal size={14} />
          <span>Execution Output</span>
        </div>
        <div className="output-actions">
          {executionResult && (
            <button onClick={handleDownload} className="btn-icon-subtle" title="Download Output">
              <Download size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="output-body">
        {isExecuting ? (
          <div className="output-status-loader">
            <span className="animate-spin">⏳</span>
            <span>Compiling in sandboxed environment via Judge0...</span>
          </div>
        ) : executionResult ? (
          <div className="output-result">
            {executionResult.stderr ? (
              <pre className="output-stderr">{executionResult.stderr}</pre>
            ) : (
              <pre className="output-stdout">{executionResult.stdout || 'Program completed with no stdout output.'}</pre>
            )}

            <div className="output-metrics">
              <div className="metric-item">
                <Cpu size={12} />
                <span>CPU Time: {executionResult.time || '0.00'}s</span>
              </div>
              <div className="metric-item">
                <span>Memory: {executionResult.memory ? `${(executionResult.memory / 1024).toFixed(2)} MB` : '0.00 MB'}</span>
              </div>
              <div className="metric-item">
                <span>Exit Code: <strong style={{ color: executionResult.exitCode === 0 ? 'var(--success)' : 'var(--danger)' }}>{executionResult.exitCode}</strong></span>
              </div>
              <div className="metric-item">
                <span className="badge badge-success">{executionResult.status || 'Success'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="output-placeholder flex-center">
            <p>Run your code to see the compilation results here.</p>
          </div>
        )}
      </div>

      <div className="output-stdin-wrapper">
        <label className="stdin-label">Interactive Standard Input (stdin)</label>
        <textarea
          className="stdin-textarea input"
          placeholder="Provide inputs here before running the code if necessary..."
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
        />
      </div>
    </div>
  );
}
