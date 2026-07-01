/* ============================================
   Landing Page — Premium SaaS Landing
   Hero, Features, Stats, Testimonials, Pricing, FAQ, Footer
   ============================================ */
import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Code2, Cpu, Users, Zap, Sparkles, ArrowRight, Play, Star,
  GitBranch, Terminal, Brain, Globe, Shield, ChevronDown,
  ChevronRight, Rocket, Award, TrendingUp, Check, Menu, X,
  Heart, MonitorSmartphone, Bot,
  BarChart3, Swords, MessageSquare, Layout, Palette, Lock,
} from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '@/components/shared/SocialIcons';
import { demoTestimonials, demoFAQ } from '@/utils/demo-data';
import { useAuthStore } from '@/stores/authStore';
import './LandingPage.css';

const CosmicScene = lazy(() => import('@/components/three/CosmicScene'));

/* ---- Typing Animation Hook ---- */
function useTypingAnimation(words: string[], speed = 100, pause = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setText(word.substring(0, text.length + 1));
        if (text.length === word.length) {
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        setText(word.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timer);
  }, [text, wordIndex, isDeleting, words, speed, pause]);

  return text;
}

/* ---- Animated Counter ---- */
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ---- Section Animation Wrapper ---- */
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================
   LANDING PAGE COMPONENT
   ============================================ */
export default function LandingPage() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const typedText = useTypingAnimation([
    'Write Beautiful Code',
    'Collaborate in Real Time',
    'Get AI Assistance',
    'Ace Your Interviews',
    'Build Amazing Projects',
    'Ship Faster Than Ever',
  ]);

  const handleStartCoding = () => {
    loginAsDemo();
    navigate('/editor');
  };

  return (
    <div className="landing">
      {/* ---- 3D Background ---- */}
      <Suspense fallback={null}>
        <CosmicScene />
      </Suspense>

      {/* ============================================
          NAVBAR
          ============================================ */}
      <nav className="nav glass-strong">
        <div className="nav-inner container-lg">
          <a href="/" className="nav-logo">
            <div className="nav-logo-orb">
              <Sparkles size={18} />
            </div>
            <span className="nav-logo-text">CodeSphere</span>
            <span className="nav-logo-badge">AI</span>
          </a>

          <div className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
            <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#testimonials" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            <a href="#faq" className="nav-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <button className="btn btn-ghost nav-link-btn" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-primary nav-cta" onClick={handleStartCoding}>
              Start Coding <ArrowRight size={16} />
            </button>
          </div>

          <button className="nav-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Introducing CodeSphere AI v1.0</span>
              <ChevronRight size={14} />
            </div>

            <h1 className="hero-title">
              <span className="hero-title-line">The Future of</span>
              <span className="hero-title-gradient text-gradient">Collaborative</span>
              <span className="hero-title-line">Development</span>
            </h1>

            <div className="hero-typing">
              <Code2 size={20} className="hero-typing-icon" />
              <span className="hero-typing-text">{typedText}</span>
              <span className="hero-typing-cursor">|</span>
            </div>

            <p className="hero-description">
              Write, run, debug, and collaborate on code in real time with AI-powered assistance.
              The most beautiful development environment ever built.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary btn-lg hero-btn-primary" onClick={handleStartCoding}>
                <Rocket size={20} />
                Start Coding — It's Free
              </button>
              <button className="btn btn-secondary btn-lg hero-btn-secondary" onClick={() => navigate('/editor')}>
                <Play size={18} />
                Watch Demo
              </button>
            </div>

            <div className="hero-social-proof">
              <div className="hero-avatars">
                {['🧑‍💻', '👩‍💻', '👨‍💻', '🧑‍🔬', '👩‍🎨'].map((emoji, i) => (
                  <div key={i} className="hero-avatar" style={{ zIndex: 5 - i }}>
                    <span>{emoji}</span>
                  </div>
                ))}
              </div>
              <div className="hero-social-text">
                <div className="hero-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <span>Loved by <strong>50,000+</strong> developers</span>
              </div>
            </div>
          </motion.div>

          {/* ---- Floating Editor Preview ---- */}
          <motion.div
            className="hero-preview"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-editor glass">
              <div className="hero-editor-toolbar">
                <div className="hero-editor-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <span className="hero-editor-title">main.tsx — CodeSphere AI</span>
                <div className="hero-editor-actions">
                  <span className="badge badge-success">● Live</span>
                </div>
              </div>
              <div className="hero-editor-code">
                <pre><code>{`import { CodeSphere } from '@codesphere/ai';

const app = new CodeSphere({
  ai: true,
  collaboration: true,
  languages: ['all'],
  theme: 'cosmic-dark',
});

// 🚀 Start building the future
app.launch();

console.log("Welcome to CodeSphere AI!");`}</code></pre>
                <div className="hero-editor-cursor" />
              </div>
              <div className="hero-editor-status">
                <span>TypeScript</span>
                <span>UTF-8</span>
                <span>Ln 12, Col 38</span>
                <span className="badge badge-primary">AI Active</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ---- Scroll Indicator ---- */}
        <motion.div
          className="hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <ChevronDown size={24} className="hero-scroll-icon" />
        </motion.div>
      </section>

      {/* ============================================
          STATS SECTION
          ============================================ */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { value: 50000, suffix: '+', label: 'Developers', icon: Users },
              { value: 2000000, suffix: '+', label: 'Lines Executed', icon: Cpu },
              { value: 17, suffix: '', label: 'Languages', icon: Code2 },
              { value: 99.9, suffix: '%', label: 'Uptime', icon: Zap },
            ].map((stat, i) => (
              <AnimatedSection key={i} className="stat-card glass-card" delay={i * 0.1}>
                <stat.icon size={24} className="stat-icon" />
                <div className="stat-value">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="stat-label">{stat.label}</div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section id="features" className="features-section section">
        <div className="container">
          <AnimatedSection className="section-header">
            <span className="section-badge badge badge-primary">
              <Sparkles size={12} /> Features
            </span>
            <h2 className="section-title">
              Everything you need,<br />
              <span className="text-gradient">nothing you don't</span>
            </h2>
            <p className="section-subtitle">
              A complete development platform with intelligent AI assistance,
              real-time collaboration, and beautiful design at every level.
            </p>
          </AnimatedSection>

          <div className="features-grid">
            {[
              { icon: Code2, title: 'Monaco Editor', desc: 'VS Code-quality editing with IntelliSense, multi-cursor, themes, and 17+ languages.', color: '#6366F1' },
              { icon: Brain, title: 'AI Assistant', desc: 'Explain, optimize, debug, and generate code with GPT-4 powered intelligence.', color: '#8B5CF6' },
              { icon: Users, title: 'Real-time Collaboration', desc: 'Live cursors, voice chat, video calls, shared terminals, and collaborative debugging.', color: '#06B6D4' },
              { icon: Terminal, title: 'Code Execution', desc: 'Run code in 12+ languages with full I/O support, memory tracking, and execution history.', color: '#10B981' },
              { icon: GitBranch, title: 'Git Integration', desc: 'Import repos, push commits, visualize branches, review diffs, and manage merge conflicts.', color: '#F59E0B' },
              { icon: Swords, title: 'Interview Mode', desc: 'Practice with real interview problems from Google, Amazon, Microsoft, and more.', color: '#EF4444' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track coding hours, language stats, contribution graphs, XP, and leaderboard rankings.', color: '#EC4899' },
              { icon: Bot, title: 'AI Code Review', desc: 'Automated code review with security analysis, complexity scoring, and optimization suggestions.', color: '#14B8A6' },
              { icon: Globe, title: 'Community Hub', desc: 'Share snippets, fork projects, follow developers, and discover trending code.', color: '#A855F7' },
              { icon: MonitorSmartphone, title: 'PWA & Offline', desc: 'Install on desktop and mobile. Work offline with automatic background sync.', color: '#F97316' },
              { icon: Layout, title: 'Collaborative Whiteboard', desc: 'Draw flowcharts, mind maps, and diagrams together in real time.', color: '#0EA5E9' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Sandboxed execution, E2E encryption, SSO, SAML, audit logs, and SOC 2 compliance.', color: '#64748B' },
            ].map((feature, i) => (
              <AnimatedSection key={i} className="feature-card glass-card" delay={i * 0.05}>
                <div className="feature-icon" style={{ background: `${feature.color}15`, color: feature.color }}>
                  <feature.icon size={24} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          EDITOR SHOWCASE
          ============================================ */}
      <section className="showcase-section section">
        <div className="container">
          <AnimatedSection className="section-header">
            <span className="section-badge badge badge-primary">
              <Palette size={12} /> Editor
            </span>
            <h2 className="section-title">
              The most beautiful<br />
              <span className="text-gradient">code editor</span> ever built
            </h2>
          </AnimatedSection>

          <AnimatedSection className="showcase-window glass" delay={0.2}>
            <div className="showcase-toolbar">
              <div className="hero-editor-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="showcase-tabs">
                <span className="showcase-tab active">main.py</span>
                <span className="showcase-tab">utils.ts</span>
                <span className="showcase-tab">styles.css</span>
              </div>
            </div>
            <div className="showcase-body">
              <div className="showcase-sidebar">
                <div className="showcase-file-tree">
                  {['📁 src', '  📄 main.py', '  📄 utils.ts', '  📄 model.py', '📁 tests', '  📄 test_main.py', '📄 README.md'].map((f, i) => (
                    <div key={i} className={`showcase-file ${i === 1 ? 'active' : ''}`}>{f}</div>
                  ))}
                </div>
              </div>
              <div className="showcase-editor">
                <div className="showcase-line-numbers">
                  {Array.from({ length: 14 }, (_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div>
                <pre className="showcase-code"><code>{`import torch
import torch.nn as nn

class NeuralNetwork(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, 10),
        )
    
    def forward(self, x):
        return self.layers(x)`}</code></pre>
                <div className="showcase-ai-suggestion">
                  <Bot size={14} />
                  <span>AI: Consider adding batch normalization for better convergence</span>
                </div>
              </div>
              <div className="showcase-output">
                <div className="showcase-output-header">
                  <Terminal size={14} />
                  <span>Output</span>
                </div>
                <pre className="showcase-output-content">
{`$ python main.py
Model initialized: 784 → 256 → 10
Training... Epoch 1/10: loss=0.342
Training... Epoch 2/10: loss=0.198
✓ Training complete! Accuracy: 97.8%`}
                </pre>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS
          ============================================ */}
      <section id="testimonials" className="testimonials-section section">
        <div className="container">
          <AnimatedSection className="section-header">
            <span className="section-badge badge badge-primary">
              <MessageSquare size={12} /> Testimonials
            </span>
            <h2 className="section-title">
              Loved by developers<br />
              <span className="text-gradient">around the world</span>
            </h2>
            <p className="section-subtitle demo-notice">
              ✨ Demo testimonials for showcase purposes
            </p>
          </AnimatedSection>

          <div className="testimonials-grid">
            {demoTestimonials.map((t, i) => (
              <AnimatedSection key={t.id} className="testimonial-card glass-card" delay={i * 0.1}>
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p className="testimonial-content">"{t.content}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-role">{t.role}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>



      {/* ============================================
          FAQ
          ============================================ */}
      <section id="faq" className="faq-section section">
        <div className="container container-sm">
          <AnimatedSection className="section-header">
            <span className="section-badge badge badge-primary">
              <MessageSquare size={12} /> FAQ
            </span>
            <h2 className="section-title">
              Frequently asked<br />
              <span className="text-gradient">questions</span>
            </h2>
          </AnimatedSection>

          <div className="faq-list">
            {demoFAQ.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <button
                  className={`faq-item glass-card ${activeFaq === i ? 'faq-active' : ''}`}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className={`faq-chevron ${activeFaq === i ? 'faq-chevron-open' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="cta-section section">
        <div className="container">
          <AnimatedSection className="cta-card">
            <div className="cta-glow" />
            <h2 className="cta-title">
              Ready to build the<br />
              <span className="text-gradient">future</span>?
            </h2>
            <p className="cta-description">
              Join 50,000+ developers who are already building amazing
              things with CodeSphere AI. Start coding for free.
            </p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-lg" onClick={handleStartCoding}>
                <Rocket size={20} />
                Start Coding Free
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
                <Award size={18} />
                View Dashboard
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="nav-logo-orb">
                  <Sparkles size={16} />
                </div>
                <span className="nav-logo-text">CodeSphere</span>
                <span className="nav-logo-badge">AI</span>
              </div>
              <p className="footer-tagline">The Future of Collaborative Development</p>
              <div className="footer-social">
                <a href="#" className="footer-social-link"><GithubIcon size={18} /></a>
                <a href="#" className="footer-social-link"><TwitterIcon size={18} /></a>
                <a href="#" className="footer-social-link"><LinkedinIcon size={18} /></a>
              </div>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-links-title">Product</h4>
              <a href="#features" className="footer-link">Features</a>
              <a href="#" className="footer-link">Changelog</a>
              <a href="#" className="footer-link">Roadmap</a>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-links-title">Resources</h4>
              <a href="#" className="footer-link">Documentation</a>
              <a href="#" className="footer-link">API Reference</a>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Tutorials</a>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-links-title">Company</h4>
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Terms</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 CodeSphere AI. Made with <Heart size={14} className="footer-heart" /> by developers, for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
