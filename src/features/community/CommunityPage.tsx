/* ============================================
   CommunityPage.tsx — Snippet Library & Social
   Browse trending snippets, fork, clone, comment
   ============================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Search, MessageSquare, ThumbsUp, GitFork, 
  Tag, Code2, Copy, Heart, User, ExternalLink, Bookmark 
} from 'lucide-react';
import { demoSnippets } from '@/utils/demo-data';
import { useUIStore } from '@/stores/uiStore';
import { useEditorStore } from '@/stores/editorStore';
import './CommunityPage.css';

export default function CommunityPage() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { addTab } = useEditorStore();
  const [snippets, setSnippets] = useState(demoSnippets);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');

  const handleLike = (id: string) => {
    setSnippets(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, likes: s.likes + 1 };
      }
      return s;
    }));
    addToast({
      type: 'success',
      title: 'Snippet Upvoted',
      message: 'Upvote registered to global rankings.',
    });
  };

  const handleFork = (snippet: typeof demoSnippets[0]) => {
    addTab({
      id: `fork-${snippet.id}-${Math.random().toString(36).substring(2, 5)}`,
      name: `fork-${snippet.title.toLowerCase().replace(/\s+/g, '-')}.js`,
      language: snippet.language,
      content: snippet.code,
    });
    addToast({
      type: 'success',
      title: 'Snippet Forked',
      message: 'Added to your active workspace tabs.',
    });
    navigate('/editor');
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    addToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: 'Snippet contents copied.',
    });
  };

  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.description.toLowerCase().includes(search.toLowerCase());
    const matchesLang = filterLang === 'all' || s.language === filterLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="community-container">
      {/* HEADER */}
      <header className="community-nav glass-strong">
        <div className="comm-nav-left" onClick={() => navigate('/')}>
          <Sparkles className="comm-logo-icon" />
          <span className="comm-logo-text text-gradient">CodeSphere Community</span>
        </div>
        <div className="comm-nav-right">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/editor')}>
            Launch IDE
          </button>
        </div>
      </header>

      <main className="community-content container-lg">
        {/* WELCOME */}
        <section className="comm-welcome">
          <h1>Public Snippet Hub</h1>
          <p>Discover, fork, and share clean algorithmic routines created by developers globally.</p>
        </section>

        {/* SEARCH AND FILTER BAR */}
        <section className="filter-bar glass-card">
          <div className="search-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search snippets (e.g. Rate Limiter, hooks)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input search-input"
            />
          </div>
          <div className="lang-filter-options">
            <button 
              className={`btn btn-sm ${filterLang === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterLang('all')}
            >
              All Languages
            </button>
            <button 
              className={`btn btn-sm ${filterLang === 'typescript' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterLang('typescript')}
            >
              TypeScript
            </button>
            <button 
              className={`btn btn-sm ${filterLang === 'python' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterLang('python')}
            >
              Python
            </button>
          </div>
        </section>

        {/* SNIPPETS GRID */}
        <section className="snippets-grid">
          {filteredSnippets.map((snippet) => (
            <div key={snippet.id} className="snippet-card glass-card">
              <div className="snippet-card-header">
                <div>
                  <h3 className="snippet-title">{snippet.title}</h3>
                  <p className="snippet-desc">{snippet.description}</p>
                </div>
                <span className="lang-tag badge badge-primary">{snippet.language}</span>
              </div>

              <div className="snippet-code-preview">
                <pre><code>{snippet.code.slice(0, 180)}...</code></pre>
                <div className="code-copy-overlay">
                  <button onClick={() => handleCopyCode(snippet.code)} className="btn btn-secondary btn-icon" title="Copy Code">
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="snippet-card-footer">
                <div className="snippet-author">
                  <User size={12} className="author-icon" />
                  <span>@{snippet.author}</span>
                </div>

                <div className="snippet-stats">
                  <button onClick={() => handleLike(snippet.id)} className="stat-btn">
                    <ThumbsUp size={12} />
                    <span>{snippet.likes}</span>
                  </button>
                  <button onClick={() => handleFork(snippet)} className="stat-btn">
                    <GitFork size={12} />
                    <span>{snippet.forks}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
export { demoSnippets };
