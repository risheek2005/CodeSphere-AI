/* ============================================
   User Activity Store — Zustand state management
   Tracks actual user activity (runs, AI chat, sketches)
   Loads and computes real-time analytics from Firestore logs.
   ============================================ */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryDocuments } from '@/services/firebase';
import { logUserActivity } from '@/services/dbSync';

export interface ActivityLog {
  id: string;
  type: 'execution' | 'commit' | 'collaboration' | 'achievement' | 'ai' | 'snippet';
  message: string;
  time: string;
  icon: string;
}

export interface UserStats {
  codingHours: number;
  totalExecutions: number;
  aiQueries: number;
  whiteboardSketches: number;
  streak: number;
  linesOfCode: number;
  projectsCount: number;
}

interface UserActivityState {
  /* ---- Mode Selection ---- */
  userState: 'new' | 'active' | 'power';
  isDemoMode: boolean; // if true, show isolated demo mode metrics
  gitHubConnected: boolean;
  pwaInstalled: boolean;
  
  /* ---- Real Activity Metrics ---- */
  stats: UserStats;
  activityFeed: ActivityLog[];
  weeklyActivity: { day: string; hours: number }[];
  monthlyCommits: { month: string; commits: number }[];
  
  /* ---- Actions ---- */
  setUserState: (state: 'new' | 'active' | 'power') => void;
  setDemoMode: (val: boolean) => void;
  connectGitHub: () => void;
  disconnectGitHub: () => void;
  installPWA: () => void;
  
  incrementExecutions: () => void;
  incrementAiQueries: () => void;
  incrementWhiteboardSketches: () => void;
  addCodingTime: (hours: number) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'time'>) => void;
  resetAllActivity: () => void;
  
  /* ---- Dynamic Firestore calculator ---- */
  loadStatsFromDB: (userId: string) => Promise<void>;
}

const initialStats: UserStats = {
  codingHours: 0,
  totalExecutions: 0,
  aiQueries: 0,
  whiteboardSketches: 0,
  streak: 0,
  linesOfCode: 0,
  projectsCount: 0,
};

const initialWeeklyActivity = [
  { day: 'Mon', hours: 0 },
  { day: 'Tue', hours: 0 },
  { day: 'Wed', hours: 0 },
  { day: 'Thu', hours: 0 },
  { day: 'Fri', hours: 0 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
];

const initialMonthlyCommits = [
  { month: 'Jan', commits: 0 }, { month: 'Feb', commits: 0 },
  { month: 'Mar', commits: 0 }, { month: 'Apr', commits: 0 },
  { month: 'May', commits: 0 }, { month: 'Jun', commits: 0 },
  { month: 'Jul', commits: 0 }, { month: 'Aug', commits: 0 },
  { month: 'Sep', commits: 0 }, { month: 'Oct', commits: 0 },
  { month: 'Nov', commits: 0 }, { month: 'Dec', commits: 0 },
];

export const useUserActivityStore = create<UserActivityState>()(
  persist(
    (set, get) => ({
      userState: 'active',
      isDemoMode: false,
      gitHubConnected: false,
      pwaInstalled: false,
      stats: initialStats,
      activityFeed: [],
      weeklyActivity: initialWeeklyActivity,
      monthlyCommits: initialMonthlyCommits,

      setUserState: (userState) => set({ userState }),
      setDemoMode: (isDemoMode) => set({ isDemoMode }),
      
      connectGitHub: () => {
        set({ gitHubConnected: true });
        get().addActivityLog({
          type: 'commit',
          message: 'Connected GitHub account successfully',
          icon: '📦',
        });
      },
      
      disconnectGitHub: () => {
        set({ gitHubConnected: false });
        get().addActivityLog({
          type: 'commit',
          message: 'Disconnected GitHub account',
          icon: '📦',
        });
      },

      installPWA: () => set({ pwaInstalled: true }),

      incrementExecutions: () => {
        set((s) => {
          const today = new Date().getDay(); // 0-6 Sun-Sat
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const todayStr = days[today];
          
          const nextWeekly = s.weeklyActivity.map((dayObj) => {
            if (dayObj.day === todayStr) {
              return { ...dayObj, hours: parseFloat((dayObj.hours + 0.1).toFixed(2)) };
            }
            return dayObj;
          });

          const currentMonth = new Date().getMonth(); // 0-11
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentMonthStr = months[currentMonth];
          
          const nextMonthly = s.monthlyCommits.map((monthObj) => {
            if (monthObj.month === currentMonthStr) {
              return { ...monthObj, commits: monthObj.commits + 1 };
            }
            return monthObj;
          });

          const nextStats = {
            ...s.stats,
            totalExecutions: s.stats.totalExecutions + 1,
            codingHours: parseFloat((s.stats.codingHours + 0.1).toFixed(2)),
            linesOfCode: s.stats.linesOfCode + Math.floor(Math.random() * 20) + 5,
            streak: s.stats.streak === 0 ? 1 : s.stats.streak,
          };

          return {
            stats: nextStats,
            weeklyActivity: nextWeekly,
            monthlyCommits: nextMonthly,
          };
        });

        get().addActivityLog({
          type: 'execution',
          message: 'Ran code compile & VM sandbox environment execution',
          icon: '▶️',
        });
      },

      incrementAiQueries: () => {
        set((s) => ({
          stats: { ...s.stats, aiQueries: s.stats.aiQueries + 1 },
        }));
        get().addActivityLog({
          type: 'ai',
          message: 'Queried CodeSphere copilot chat assistant',
          icon: '🤖',
        });
      },

      incrementWhiteboardSketches: () => {
        set((s) => ({
          stats: { ...s.stats, whiteboardSketches: s.stats.whiteboardSketches + 1 },
        }));
        get().addActivityLog({
          type: 'collaboration',
          message: 'Modified whiteboard collaboration sketchpad canvas',
          icon: '🎨',
        });
      },

      addCodingTime: (hours) => {
        set((s) => ({
          stats: { ...s.stats, codingHours: parseFloat((s.stats.codingHours + hours).toFixed(2)) },
        }));
      },

      addActivityLog: (log) => {
        const id = `act-real-${Math.random().toString(36).substring(2, 9)}`;
        const time = 'Just now';
        const newLog: ActivityLog = { ...log, id, time };
        
        set((s) => ({
          activityFeed: [newLog, ...s.activityFeed].slice(0, 30),
        }));
      },

      resetAllActivity: () => {
        set({
          stats: initialStats,
          activityFeed: [],
          weeklyActivity: initialWeeklyActivity,
          monthlyCommits: initialMonthlyCommits,
          gitHubConnected: false,
          pwaInstalled: false,
        });
      },

      loadStatsFromDB: async (userId) => {
        try {
          const [sessions, projects, executions, activities] = await Promise.all([
            queryDocuments<any>('editorSessions', 'userId', '==', userId),
            queryDocuments<any>('projects', 'userId', '==', userId),
            queryDocuments<any>('executions', 'userId', '==', userId),
            queryDocuments<any>('activities', 'userId', '==', userId),
          ]);

          // Calculate coding hours
          const totalSeconds = sessions.reduce((acc: number, s: any) => acc + (s.durationSeconds || 0), 0);
          const codingHours = parseFloat((totalSeconds / 3600).toFixed(2));

          // Streak calculation
          const activeDates = new Set(
            [...sessions, ...executions, ...activities].map(item => {
              const d = new Date(item.timestamp);
              return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            })
          );
          const streak = activeDates.size;

          // Counts
          const aiQueries = activities.filter((a: any) => a.type === 'ai').length;
          const whiteboardSketches = activities.filter((a: any) => a.type === 'collaboration').length;
          const linesOfCode = executions.length * 45; // estimation per run
          const projectsCount = projects.length;

          // Weekly Activity
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const weeklyActivityMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          sessions.forEach((s: any) => {
            if (s.timestamp >= oneWeekAgo) {
              const day = daysOfWeek[new Date(s.timestamp).getDay()];
              weeklyActivityMap[day] = (weeklyActivityMap[day] || 0) + (s.durationSeconds || 0) / 3600;
            }
          });
          const weeklyActivity = Object.entries(weeklyActivityMap).map(([day, val]) => ({
            day,
            hours: parseFloat(val.toFixed(2))
          }));

          // Monthly Commits
          const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthlyCommitsMap: Record<string, number> = {};
          monthsOfYear.forEach(m => { monthlyCommitsMap[m] = 0; });
          executions.forEach((e: any) => {
            const m = monthsOfYear[new Date(e.timestamp).getMonth()];
            monthlyCommitsMap[m] = (monthlyCommitsMap[m] || 0) + 1;
          });
          const monthlyCommits = Object.entries(monthlyCommitsMap).map(([month, commits]) => ({
            month,
            commits
          }));

          set({
            stats: {
              codingHours,
              totalExecutions: executions.length,
              aiQueries,
              whiteboardSketches,
              streak,
              linesOfCode,
              projectsCount,
            },
            weeklyActivity,
            monthlyCommits,
            activityFeed: activities.slice(0, 10).map((a: any) => ({
              id: a.id || String(a.timestamp),
              type: a.type as any,
              message: a.message,
              time: a.time,
              icon: a.icon
            }))
          });
        } catch (e) {
          console.error("Failed to load user activity stats from DB:", e);
        }
      }
    }),
    {
      name: 'codesphere-user-activity',
    },
  ),
);
