/* ============================================
   Loading Screen — Displayed during lazy loading
   ============================================ */
import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="loading-orb">
            <div className="loading-orb-inner" />
          </div>
          <h1 className="loading-title">
            <span className="text-gradient">CodeSphere</span>
            <span className="loading-ai">AI</span>
          </h1>
        </div>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
        <p className="loading-text">Initializing workspace...</p>
      </div>
    </div>
  );
}
