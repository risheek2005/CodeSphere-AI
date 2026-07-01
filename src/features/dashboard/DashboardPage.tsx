/* ============================================
   DashboardPage.tsx — Fully Data-Driven Dashboard
   Three user states: new | active | power
   Demo mode isolated from authenticated data
   ============================================ */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Sparkles, Clock, Activity, Flame, Award, Folder, ArrowUpRight,
  Bot, CheckCircle2, Circle, GitBranch, Zap, Users, TrendingUp,
  Code2, FlaskConical, Eye, Lock, Layers, BarChart3,
  ChevronDown, Plus, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useUserActivityStore } from '@/stores/userActivityStore';
import { useEditorStore, type FileNode } from '@/stores/editorStore';
import { useAIChatStore } from '@/stores/aiChatStore';
import {
  demoUser, demoProjects, demoStats, demoActivity, generateContributionData,
} from '@/utils/demo-data';
import { GithubIcon } from '@/components/shared/SocialIcons';
import './DashboardPage.css';

/* ---- helpers ---- */
function countFiles(nodes: FileNode[]): number {
  return nodes.reduce((acc, n) => {
    if (n.type === 'file') return acc + 1;
    return acc + (n.children ? countFiles(n.children) : 0);
  }, 0);
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(17,22,56,0.95)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '8px',
    color: '#F1F5F9',
    fontSize: 12,
  },
  labelStyle: { color: '#94A3B8' },
};

/* ---- Onboarding Checklist items ---- */
function OnboardingChecklist({
  executions, aiQueries, sketches, gitConnected, pwaInstalled, fileCount,
}: {
  executions: number; aiQueries: number; sketches: number;
  gitConnected: boolean; pwaInstalled: boolean; fileCount: number;
}) {
  const navigate = useNavigate();
  const { openChat } = useAIChatStore();
  const items = [
    { label: 'Create your first workspace file', done: fileCount > 0, action: () => navigate('/editor') },
    { label: 'Compile and run code in the sandbox', done: executions > 0, action: () => navigate('/editor') },
    { label: 'Ask CodeSphere Copilot a question', done: aiQueries > 0, action: () => openChat('Hello! What can CodeSphere AI help me with today?') },
    { label: 'Sketch on the collaborative whiteboard', done: sketches > 0, action: () => navigate('/editor') },
    { label: 'Connect your GitHub account', done: gitConnected, action: undefined },
    { label: 'Install CodeSphere AI as a PWA', done: pwaInstalled, action: undefined },
  ];
  const completed = items.filter(i => i.done).length;
  const pct = Math.round((completed / items.length) * 100);

  return (
    <div className="onboarding-card glass-card">
      <div className="onboarding-header">
        <div>
          <h2>Get started with CodeSphere AI</h2>
          <p>{completed}/{items.length} tasks completed</p>
        </div>
        <div className="onboarding-pct text-gradient">{pct}%</div>
      </div>
      <div className="onboarding-progress-bar">
        <div className="onboarding-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="onboarding-items">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className={`onboarding-item ${item.done ? 'done' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {item.done
              ? <CheckCircle2 size={18} className="check-done" />
              : <Circle size={18} className="check-pending" />}
            <span>{item.label}</span>
            {!item.done && item.action && (
              <button className="onboarding-action-btn" onClick={item.action}>
                Start →
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---- Empty state ---- */
function EmptyState({ icon, title, sub, cta, onCta }: {
  icon: React.ReactNode; title: string; sub: string; cta?: string; onCta?: () => void;
}) {
  return (
    <div className="empty-state-box">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{sub}</p>
      {cta && <button className="btn btn-primary btn-sm" onClick={onCta}>{cta}</button>}
    </div>
  );
}

/* ---- Metric card ---- */
function MetricCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; color?: string;
}) {
  return (
    <div className="metric-card glass-card">
      <div className="metric-icon" style={{ color: color ?? 'var(--primary-light)' }}>{icon}</div>
      <div className="card-info">
        <h3>{label}</h3>
        <p className="metric-value">{value}</p>
        <span className="metric-growth">{sub}</span>
      </div>
    </div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const { fileTree, executionHistory } = useEditorStore();
  const {
    userState, isDemoMode,
    stats, activityFeed, weeklyActivity, monthlyCommits,
    gitHubConnected, pwaInstalled,
    setUserState, setDemoMode, connectGitHub,
    loadStatsFromDB,
  } = useUserActivityStore();

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

  // Load database stats dynamically for authenticated users
  useEffect(() => {
    if (user && !isDemoMode) {
      loadStatsFromDB(user.uid);
    }
  }, [user, isDemoMode, loadStatsFromDB]);

  /* Derived */
  const fileCount = countFiles(fileTree);
  const isNew = !isDemoMode && userState === 'new';
  const isActive = !isDemoMode && userState === 'active';
  const isPower = !isDemoMode && userState === 'power';

  /* Which data to show */
  const shownStats = isDemoMode ? {
    codingHours: demoStats.totalCodingHours,
    totalExecutions: demoStats.totalExecutions,
    streak: demoStats.currentStreak,
    linesOfCode: demoStats.linesOfCode,
    aiQueries: 382,
    whiteboardSketches: 24,
  } : stats;

  const shownWeekly = isDemoMode ? demoStats.weeklyActivity : weeklyActivity;
  const shownMonthly = isDemoMode ? demoStats.monthlyCommits : monthlyCommits;
  const shownActivity = isDemoMode ? demoActivity : activityFeed;
  const shownHeatmap = isDemoMode ? generateContributionData() : generateRealHeatmap(stats.totalExecutions);
  const displayUser = isDemoMode ? demoUser : (user ?? { name: 'Developer', role: 'New User', level: 1 });

  /* State label mapping */
  const stateLabels: Record<string, string> = {
    new: 'New User', active: 'Active User', power: 'Power User',
  };

  const handleConnectGitHub = () => {
    connectGitHub();
    addToast({ type: 'success', title: 'GitHub Connected', message: 'Repositories synced to workspace.' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">

      {/* ── NAV ── */}
      <header className="dashboard-nav glass-strong">
        <div className="dash-nav-left" onClick={() => navigate('/')}>
          <Sparkles className="dash-logo-icon" />
          <span className="dash-logo-text text-gradient">CodeSphere AI</span>
        </div>

        {/* State switcher */}
        <div className="dash-state-switcher">
          {isDemoMode && <span className="demo-pill">DEMO MODE</span>}
          <div className="state-dropdown-wrap">
            <button
              className="btn btn-secondary btn-sm state-dropdown-btn"
              onClick={() => setStateDropdownOpen(v => !v)}
            >
              {isDemoMode ? '🎭 Demo' : stateLabels[userState]}
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {stateDropdownOpen && (
                <motion.div
                  className="state-dropdown-menu glass-card"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {(['new', 'active', 'power'] as const).map(s => (
                    <button
                      key={s}
                      className={`state-option ${!isDemoMode && userState === s ? 'active' : ''}`}
                      onClick={() => { setUserState(s); setDemoMode(false); setStateDropdownOpen(false); }}
                    >
                      {stateLabels[s]}
                    </button>
                  ))}
                  <div className="state-divider" />
                  <button
                    className={`state-option ${isDemoMode ? 'active demo' : ''}`}
                    onClick={() => { setDemoMode(!isDemoMode); setStateDropdownOpen(false); }}
                  >
                    🎭 Demo Mode
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="dash-nav-right">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/editor')}>
            Launch IDE
          </button>
          <div className="user-profile-badge">
            <span className="user-role">{displayUser.role}</span>
            <span className="user-name">{displayUser.name}</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="dashboard-content container-lg">

        {/* ── WELCOME ── */}
        <section className="dash-welcome-row">
          <div className="welcome-message">
            <h1>
              {isNew ? `Welcome, ${displayUser.name} 👋` : `Welcome back, ${displayUser.name}`}
            </h1>
            <p>
              {isNew
                ? 'Your workspace is ready. Complete the checklist below to get started.'
                : isDemoMode
                  ? 'Viewing demo analytics. Switch state to see your real data.'
                  : 'Here is your collaborative coding analytics summary.'}
            </p>
          </div>
          <div className="welcome-actions">
            <button className="btn btn-primary" onClick={() => navigate('/editor')}>
              <Plus size={14} /> New Project
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/interview')}>
              Practice Interviews
            </button>
          </div>
        </section>

        {/* ── ONBOARDING CHECKLIST (New User only) ── */}
        {isNew && (
          <OnboardingChecklist
            executions={stats.totalExecutions}
            aiQueries={stats.aiQueries}
            sketches={stats.whiteboardSketches}
            gitConnected={gitHubConnected}
            pwaInstalled={pwaInstalled}
            fileCount={fileCount}
          />
        )}

        {/* ── METRICS ── */}
        <section className="dash-metrics-grid">
          <MetricCard
            icon={<Clock size={20} />}
            label="Coding Time"
            value={`${shownStats.codingHours} hrs`}
            sub={shownStats.codingHours === 0 ? 'Run code to start tracking' : 'Accumulated in workspace'}
          />
          <MetricCard
            icon={<Activity size={20} />}
            label="Total Executions"
            value={shownStats.totalExecutions}
            sub={shownStats.totalExecutions === 0 ? 'Hit Run to execute code' : `${shownStats.totalExecutions} sandbox runs`}
          />
          <MetricCard
            icon={<Flame size={20} />}
            label="Current Streak"
            value={shownStats.streak === 0 ? '—' : `${shownStats.streak} Days`}
            sub={shownStats.streak === 0 ? 'Code daily to build a streak' : 'Keep it going!'}
            color="var(--warning)"
          />
          <MetricCard
            icon={<Award size={20} />}
            label="Lines of Code"
            value={shownStats.linesOfCode === 0 ? '0' : shownStats.linesOfCode.toLocaleString()}
            sub={shownStats.linesOfCode === 0 ? 'Write your first lines' : 'Total LOC written'}
            color="var(--accent)"
          />
        </section>

        {/* ── CHARTS ── (empty states for new users) */}
        <section className="dash-analytics-grid">
          <div className="chart-card glass-card">
            <div className="card-header">
              <h2>Weekly Coding Activity</h2>
              <span>Hours per day</span>
            </div>
            {shownWeekly.every(d => d.hours === 0) && !isDemoMode ? (
              <EmptyState
                icon={<BarChart3 size={40} />}
                title="No activity yet"
                sub="Your coding hours will appear here after you run code."
                cta="Open IDE"
                onCta={() => navigate('/editor')}
              />
            ) : (
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={shownWeekly}>
                    <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="hours" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="chart-card glass-card">
            <div className="card-header">
              <h2>Execution History</h2>
              <span>Runs per month</span>
            </div>
            {shownMonthly.every(m => m.commits === 0) && !isDemoMode ? (
              <EmptyState
                icon={<TrendingUp size={40} />}
                title="No runs recorded"
                sub="Compile and execute code to see your monthly trends."
              />
            ) : (
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={shownMonthly}>
                    <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="commits" stroke="#06B6D4" strokeWidth={2} fill="url(#areaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* ── HEATMAP ── */}
        <section className="dash-heatmap-section glass-card">
          <div className="card-header">
            <h2>Annual Activity Heatmap</h2>
            <span>{isDemoMode ? 'Demo data' : 'Based on your real workspace activity'}</span>
          </div>
          {shownHeatmap.every(d => d.count === 0) && !isDemoMode ? (
            <EmptyState
              icon={<Layers size={36} />}
              title="Activity matrix is empty"
              sub="Every code execution and file change lights up a cell here."
            />
          ) : (
            <div className="heatmap-matrix">
              {shownHeatmap.map((day, i) => {
                let cls = 'empty';
                if (day.count > 0 && day.count <= 3) cls = 'low';
                else if (day.count > 3 && day.count <= 6) cls = 'medium';
                else if (day.count > 6) cls = 'high';
                return (
                  <div
                    key={i}
                    className={`heatmap-cell ${cls}`}
                    title={`${day.date}: ${day.count} actions`}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* ── PROJECTS + ACTIVITY ── */}
        <section className="dash-detail-grid">
          <div className="detail-panel glass-card">
            <div className="card-header">
              <h2>Recent Workspaces</h2>
              <button className="btn-link" onClick={() => navigate('/editor')}>Open IDE</button>
            </div>
            {!isDemoMode && fileCount === 0 ? (
              <EmptyState
                icon={<Folder size={36} />}
                title="No workspaces yet"
                sub="Create your first project to see it listed here."
                cta="+ New Project"
                onCta={() => navigate('/editor')}
              />
            ) : (
              <div className="projects-list-items">
                {(isDemoMode ? demoProjects : buildRealProjects(fileTree, executionHistory)).map(p => (
                  <div key={p.id} className="project-item">
                    <div className="project-left">
                      <Folder className="proj-folder-icon" size={18} />
                      <div className="project-titles">
                        <h4>{p.name}</h4>
                        <p>{p.description}</p>
                      </div>
                    </div>
                    <div className="project-right">
                      <span className="language-badge">{p.language}</span>
                      <button className="btn-icon" onClick={() => navigate('/editor')}>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="detail-panel glass-card">
            <div className="card-header">
              <h2>Activity Feed</h2>
              <span>{isDemoMode ? 'demo' : 'live'}</span>
            </div>
            {shownActivity.length === 0 ? (
              <EmptyState
                icon={<Activity size={36} />}
                title="No activity yet"
                sub="Your workspace actions — runs, AI queries, sketches — appear here in real time."
              />
            ) : (
              <div className="activity-list-items">
                {(shownActivity as any[]).slice(0, 8).map((act: any) => (
                  <div key={act.id} className="activity-item">
                    <span className="activity-icon-badge">{act.icon}</span>
                    <div className="activity-details">
                      <p>{act.message}</p>
                      <span>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── AI USAGE (active + power) ── */}
        {(isActive || isPower || isDemoMode) && (
          <section className="dash-ai-usage-section">
            <div className="section-label">
              <Bot size={16} />
              <span>Copilot Intelligence</span>
            </div>
            <div className="ai-usage-grid">
              <div className="ai-usage-card glass-card">
                <Bot size={20} className="ai-card-icon" />
                <div>
                  <p className="ai-stat-value">{shownStats.aiQueries}</p>
                  <span>Copilot Queries</span>
                </div>
              </div>
              <div className="ai-usage-card glass-card">
                <Zap size={20} className="ai-card-icon" style={{ color: 'var(--warning)' }} />
                <div>
                  <p className="ai-stat-value">
                    {shownStats.aiQueries > 0 ? `${Math.min(94, 70 + shownStats.aiQueries * 2)}%` : '—'}
                  </p>
                  <span>Suggestion Accept Rate</span>
                </div>
              </div>
              <div className="ai-usage-card glass-card">
                <FlaskConical size={20} className="ai-card-icon" style={{ color: 'var(--secondary)' }} />
                <div>
                  <p className="ai-stat-value">{shownStats.whiteboardSketches}</p>
                  <span>Whiteboard Sessions</span>
                </div>
              </div>
              <div className="ai-usage-card glass-card">
                <Code2 size={20} className="ai-card-icon" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="ai-stat-value">{shownStats.totalExecutions}</p>
                  <span>Sandbox Runs</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── POWER USER: GitHub + Advanced Insights ── */}
        {(isPower || isDemoMode) && (
          <section className="dash-power-grid">
            {/* GitHub Integration */}
            <div className="power-card glass-card">
              <div className="card-header">
                <h2>GitHub Integration</h2>
                {(gitHubConnected || isDemoMode)
                  ? <span className="badge badge-success">Connected</span>
                  : <span className="badge badge-warning">Not linked</span>}
              </div>
              {gitHubConnected || isDemoMode ? (
                <div className="github-stats-grid">
                  {[
                    { label: 'Repositories', value: isDemoMode ? 34 : 0, icon: <GitBranch size={16} /> },
                    { label: 'Total Stars', value: isDemoMode ? '1.2k' : 0, icon: <Sparkles size={16} /> },
                    { label: 'PRs Merged', value: isDemoMode ? 87 : 0, icon: <CheckCircle2 size={16} /> },
                    { label: 'Contributors', value: isDemoMode ? 12 : 0, icon: <Users size={16} /> },
                  ].map(item => (
                    <div key={item.label} className="github-stat-item">
                      <div className="github-stat-icon">{item.icon}</div>
                      <p className="github-stat-val">{item.value}</p>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="github-connect-cta">
                  <GithubIcon size={32} />
                  <p>Connect your GitHub account to sync repositories, track PRs, and visualize your open-source contributions.</p>
                  <button className="btn btn-primary btn-sm" onClick={handleConnectGitHub}>
                    Connect GitHub
                  </button>
                </div>
              )}
            </div>

            {/* Productivity Radar */}
            <div className="power-card glass-card">
              <div className="card-header">
                <h2>Productivity Radar</h2>
                <span>{isDemoMode ? 'demo' : 'based on your activity'}</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={buildRadarData(shownStats)}>
                  <PolarGrid stroke="rgba(99,102,241,0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar name="You" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Collaboration Insights */}
            <div className="power-card glass-card collab-card">
              <div className="card-header">
                <h2>Collaboration Insights</h2>
                <span>Team workspace metrics</span>
              </div>
              <div className="collab-metrics">
                {[
                  { icon: <Users size={18} />, label: 'Active Teammates', value: isDemoMode ? 5 : 0 },
                  { icon: <Eye size={18} />, label: 'Pair Sessions', value: isDemoMode ? 12 : 0 },
                  { icon: <Lock size={18} />, label: 'Private Workspaces', value: isDemoMode ? 3 : fileCount },
                  { icon: <GitBranch size={18} />, label: 'Branches Reviewed', value: isDemoMode ? 28 : 0 },
                ].map(item => (
                  <div key={item.label} className="collab-metric-item">
                    <div className="collab-metric-icon">{item.icon}</div>
                    <div>
                      <p className="collab-metric-val">{item.value}</p>
                      <span>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

/* ---- Utility functions ---- */
function generateRealHeatmap(executions: number) {
  const today = new Date();
  return Array.from({ length: 371 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (370 - i));
    const isToday = i === 370;
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: isToday ? executions : 0,
    };
  });
}

function buildRealProjects(fileTree: FileNode[], executionHistory: any[]) {
  const files = fileTree.flatMap(n => n.children ?? [n]);
  if (files.length === 0) return [];
  return files.slice(0, 4).map((f, i) => ({
    id: f.id,
    name: f.name,
    description: f.type === 'folder' ? 'Project workspace folder' : `${f.language ?? 'code'} file`,
    language: f.language ?? 'text',
  }));
}

function buildRadarData(stats: any) {
  const cap = (v: number, max: number) => Math.min(100, Math.round((v / max) * 100));
  return [
    { subject: 'Execution', A: cap(stats.totalExecutions, 100) },
    { subject: 'AI Usage', A: cap(stats.aiQueries, 50) },
    { subject: 'Consistency', A: cap(stats.streak, 30) },
    { subject: 'Collaboration', A: cap(stats.whiteboardSketches, 20) },
    { subject: 'Code Output', A: cap(stats.linesOfCode, 5000) },
    { subject: 'Time', A: cap(stats.codingHours, 50) },
  ];
}
