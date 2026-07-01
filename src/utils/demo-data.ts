/* ============================================
   Demo Data for CodeSphere AI
   Realistic data for showcasing the platform
   ============================================ */

export const demoUser = {
  id: 'user-001',
  name: 'Alex Chen',
  email: 'alex@codesphere.dev',
  avatar: '',
  role: 'Pro Developer',
  joined: '2024-06-15',
  streak: 47,
  xp: 12450,
  level: 24,
  title: 'Code Architect',
  bio: 'Full-stack developer passionate about building beautiful, performant applications.',
  location: 'San Francisco, CA',
  github: 'alexchen',
  twitter: 'alexchen_dev',
  website: 'https://alexchen.dev',
  languages: ['TypeScript', 'Python', 'Go', 'Rust'],
  badges: [
    { id: 'streak-30', name: '30-Day Streak', icon: '🔥', earned: '2024-11-01' },
    { id: 'first-collab', name: 'First Collaboration', icon: '👥', earned: '2024-07-20' },
    { id: 'ai-explorer', name: 'AI Explorer', icon: '🤖', earned: '2024-08-15' },
    { id: 'code-reviewer', name: 'Code Reviewer', icon: '🔍', earned: '2024-09-10' },
    { id: 'speed-coder', name: 'Speed Coder', icon: '⚡', earned: '2024-10-05' },
    { id: 'bug-hunter', name: 'Bug Hunter', icon: '🐛', earned: '2024-10-20' },
  ],
};

export const demoProjects = [
  {
    id: 'proj-001',
    name: 'Neural Style Transfer',
    description: 'AI-powered image style transfer using deep learning',
    language: 'python',
    lastModified: '2024-12-08T14:30:00Z',
    stars: 234,
    forks: 56,
    isPublic: true,
    collaborators: 3,
  },
  {
    id: 'proj-002',
    name: 'React Component Library',
    description: 'Modern, accessible component library with Storybook',
    language: 'typescript',
    lastModified: '2024-12-07T09:15:00Z',
    stars: 567,
    forks: 89,
    isPublic: true,
    collaborators: 5,
  },
  {
    id: 'proj-003',
    name: 'Real-time Chat Engine',
    description: 'Scalable WebSocket-based chat engine with E2E encryption',
    language: 'go',
    lastModified: '2024-12-06T18:45:00Z',
    stars: 123,
    forks: 34,
    isPublic: false,
    collaborators: 2,
  },
  {
    id: 'proj-004',
    name: 'CLI Task Manager',
    description: 'Beautiful terminal task manager with TUI',
    language: 'rust',
    lastModified: '2024-12-05T11:20:00Z',
    stars: 89,
    forks: 12,
    isPublic: true,
    collaborators: 1,
  },
  {
    id: 'proj-005',
    name: 'GraphQL API Gateway',
    description: 'Federated GraphQL gateway with rate limiting',
    language: 'typescript',
    lastModified: '2024-12-04T16:00:00Z',
    stars: 345,
    forks: 78,
    isPublic: true,
    collaborators: 4,
  },
  {
    id: 'proj-006',
    name: 'ML Pipeline Framework',
    description: 'End-to-end machine learning pipeline orchestration',
    language: 'python',
    lastModified: '2024-12-03T08:30:00Z',
    stars: 678,
    forks: 145,
    isPublic: true,
    collaborators: 7,
  },
];

export const demoStats = {
  totalCodingHours: 1247,
  totalExecutions: 8934,
  totalProjects: 42,
  totalCollaborations: 156,
  currentStreak: 47,
  longestStreak: 92,
  linesOfCode: 234567,
  languageBreakdown: [
    { name: 'TypeScript', hours: 420, percentage: 33.7, color: '#3178C6' },
    { name: 'Python', hours: 310, percentage: 24.9, color: '#3776AB' },
    { name: 'Go', hours: 180, percentage: 14.4, color: '#00ADD8' },
    { name: 'Rust', hours: 145, percentage: 11.6, color: '#CE422B' },
    { name: 'JavaScript', hours: 102, percentage: 8.2, color: '#F7DF1E' },
    { name: 'Java', hours: 90, percentage: 7.2, color: '#ED8B00' },
  ],
  weeklyActivity: [
    { day: 'Mon', hours: 4.2 },
    { day: 'Tue', hours: 5.8 },
    { day: 'Wed', hours: 3.5 },
    { day: 'Thu', hours: 6.1 },
    { day: 'Fri', hours: 7.3 },
    { day: 'Sat', hours: 2.8 },
    { day: 'Sun', hours: 1.9 },
  ],
  monthlyCommits: [
    { month: 'Jan', commits: 45 }, { month: 'Feb', commits: 62 },
    { month: 'Mar', commits: 78 }, { month: 'Apr', commits: 55 },
    { month: 'May', commits: 91 }, { month: 'Jun', commits: 83 },
    { month: 'Jul', commits: 72 }, { month: 'Aug', commits: 95 },
    { month: 'Sep', commits: 88 }, { month: 'Oct', commits: 104 },
    { month: 'Nov', commits: 120 }, { month: 'Dec', commits: 67 },
  ],
};

// Contribution heatmap data (365 days)
export const generateContributionData = (): { date: string; count: number }[] => {
  const data: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    // Higher activity on weekdays
    const baseActivity = dayOfWeek === 0 || dayOfWeek === 6 ? 2 : 5;
    const count = Math.random() < 0.15 ? 0 : Math.floor(Math.random() * baseActivity * 2);
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.min(count, 12),
    });
  }
  return data;
};

export const demoTestimonials = [
  {
    id: 't1',
    name: 'Sarah Johnson',
    role: 'Senior Engineer at Meta',
    avatar: '',
    content: 'CodeSphere AI completely transformed how our team collaborates on code. The AI assistant is like having a senior engineer pair-programming with you 24/7.',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Marcus Kim',
    role: 'CTO at Vercel',
    avatar: '',
    content: 'The real-time collaboration features are incredible. We\'ve cut our code review time in half. The UI is the most beautiful IDE I\'ve ever used.',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Priya Sharma',
    role: 'Staff Engineer at Google',
    avatar: '',
    content: 'I use CodeSphere for all my side projects and interview prep. The integrated execution engine and AI assistance make it an unbeatable combination.',
    rating: 5,
  },
  {
    id: 't4',
    name: 'James Rodriguez',
    role: 'Tech Lead at Stripe',
    avatar: '',
    content: 'Finally, an IDE that understands developers. From the buttery smooth animations to the intelligent code suggestions, every detail is perfectly crafted.',
    rating: 5,
  },
];

export const demoSnippets = [
  {
    id: 'snip-001',
    title: 'Async Rate Limiter',
    description: 'Token bucket rate limiter with async/await support',
    language: 'typescript',
    code: `class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private maxTokens: number,
    private refillRate: number
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }
  
  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens <= 0) {
      const wait = (1 / this.refillRate) * 1000;
      await new Promise(r => setTimeout(r, wait));
      return this.acquire();
    }
    this.tokens--;
  }
  
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + elapsed * this.refillRate
    );
    this.lastRefill = now;
  }
}`,
    author: 'alexchen',
    likes: 89,
    forks: 23,
    isPublic: true,
    tags: ['async', 'rate-limiting', 'typescript'],
    createdAt: '2024-11-15T10:30:00Z',
  },
  {
    id: 'snip-002',
    title: 'React useDebounce Hook',
    description: 'Custom debounce hook with cancel support',
    language: 'typescript',
    code: `import { useState, useEffect, useRef, useCallback } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}`,
    author: 'devmaster',
    likes: 156,
    forks: 45,
    isPublic: true,
    tags: ['react', 'hooks', 'debounce'],
    createdAt: '2024-10-20T14:00:00Z',
  },
  {
    id: 'snip-003',
    title: 'Python Decorator Timer',
    description: 'Measure function execution time with a decorator',
    language: 'python',
    code: `import time
import functools

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "done"`,
    author: 'pythonista',
    likes: 78,
    forks: 12,
    isPublic: true,
    tags: ['python', 'decorator', 'performance'],
    createdAt: '2024-09-05T08:00:00Z',
  },
];

export const demoInterviewProblems = [
  {
    id: 'prob-001',
    title: 'Two Sum',
    difficulty: 'Easy' as const,
    company: 'Google',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: '' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists'],
    hints: ['Think about using a hash map to store values you\'ve seen.'],
    starterCode: {
      python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    pass',
      javascript: 'function twoSum(nums, target) {\n    \n}',
      typescript: 'function twoSum(nums: number[], target: number): number[] {\n    \n}',
    },
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1' },
      { input: '3 2 4\n6', expectedOutput: '1 2' },
      { input: '3 3\n6', expectedOutput: '0 1' },
    ],
    tags: ['Array', 'Hash Table'],
    acceptance: 49.2,
  },
  {
    id: 'prob-002',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium' as const,
    company: 'Amazon',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
    hints: ['Use a sliding window approach.'],
    starterCode: {
      python: 'def lengthOfLongestSubstring(s: str) -> int:\n    pass',
      javascript: 'function lengthOfLongestSubstring(s) {\n    \n}',
      typescript: 'function lengthOfLongestSubstring(s: string): number {\n    \n}',
    },
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3' },
      { input: 'bbbbb', expectedOutput: '1' },
      { input: 'pwwkew', expectedOutput: '3' },
    ],
    tags: ['String', 'Sliding Window', 'Hash Table'],
    acceptance: 33.8,
  },
  {
    id: 'prob-003',
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard' as const,
    company: 'Microsoft',
    description: 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: '' },
    ],
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500'],
    hints: ['Consider using a min-heap (priority queue).'],
    starterCode: {
      python: 'def mergeKLists(lists):\n    pass',
      javascript: 'function mergeKLists(lists) {\n    \n}',
      typescript: 'function mergeKLists(lists: Array<ListNode | null>): ListNode | null {\n    \n}',
    },
    testCases: [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]' },
    ],
    tags: ['Linked List', 'Divide and Conquer', 'Heap'],
    acceptance: 47.6,
  },
];

export const demoLeaderboard = [
  { rank: 1, name: 'Kai Zhang', xp: 28400, level: 42, streak: 156, avatar: '' },
  { rank: 2, name: 'Elena Petrova', xp: 25100, level: 38, streak: 89, avatar: '' },
  { rank: 3, name: 'Raj Patel', xp: 23800, level: 36, streak: 134, avatar: '' },
  { rank: 4, name: 'Sophie Martin', xp: 21200, level: 34, streak: 67, avatar: '' },
  { rank: 5, name: 'Alex Chen', xp: 12450, level: 24, streak: 47, avatar: '' },
  { rank: 6, name: 'Jordan Lee', xp: 11800, level: 23, streak: 35, avatar: '' },
  { rank: 7, name: 'Aisha Hassan', xp: 10500, level: 21, streak: 28, avatar: '' },
  { rank: 8, name: 'Liam O\'Brien', xp: 9800, level: 20, streak: 42, avatar: '' },
  { rank: 9, name: 'Yuki Tanaka', xp: 8900, level: 19, streak: 21, avatar: '' },
  { rank: 10, name: 'Maria Garcia', xp: 8200, level: 18, streak: 56, avatar: '' },
];

export const demoActivity = [
  { id: 'act-1', type: 'execution', message: 'Ran Python script — All tests passed', time: '2 minutes ago', icon: '▶️' },
  { id: 'act-2', type: 'commit', message: 'Pushed 3 commits to neural-style-transfer', time: '15 minutes ago', icon: '📦' },
  { id: 'act-3', type: 'collaboration', message: 'Started pair programming with Sarah J.', time: '1 hour ago', icon: '👥' },
  { id: 'act-4', type: 'achievement', message: 'Earned "Bug Hunter" badge', time: '3 hours ago', icon: '🏆' },
  { id: 'act-5', type: 'ai', message: 'AI optimized quicksort implementation', time: '5 hours ago', icon: '🤖' },
  { id: 'act-6', type: 'snippet', message: 'Published "Async Rate Limiter" snippet', time: '1 day ago', icon: '📝' },
  { id: 'act-7', type: 'execution', message: 'Ran Go benchmark — 2.3ms avg', time: '1 day ago', icon: '▶️' },
  { id: 'act-8', type: 'interview', message: 'Solved "Two Sum" in 4:32', time: '2 days ago', icon: '🎯' },
];

export const demoPricing = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for learning and personal projects',
    features: [
      '5 Projects',
      '10 Executions/day',
      'Basic AI Assistant',
      'Public Snippets',
      'Community Access',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 12,
    period: 'month',
    description: 'For professional developers who want more',
    features: [
      'Unlimited Projects',
      'Unlimited Executions',
      'Advanced AI (GPT-4)',
      'Private Snippets',
      'Real-time Collaboration',
      'Interview Mode',
      'Code Replay',
      'Priority Support',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: 29,
    period: 'user/month',
    description: 'For teams building great software together',
    features: [
      'Everything in Pro',
      'Team Workspaces',
      'Admin Dashboard',
      'SSO & SAML',
      'Custom Integrations',
      'SLA & Support',
      'Audit Logs',
      'On-premise Option',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export const demoFAQ = [
  {
    q: 'What makes CodeSphere AI different from other online IDEs?',
    a: 'CodeSphere AI combines a premium code editor, real-time collaboration, AI assistance, code execution, interview prep, and analytics — all in one beautiful, seamless experience. Think VS Code meets GitHub meets ChatGPT.',
  },
  {
    q: 'Which programming languages are supported?',
    a: 'We support 17+ languages including JavaScript, TypeScript, Python, Java, C++, C, Go, Rust, Swift, Kotlin, PHP, Ruby, SQL, HTML, CSS, JSON, and Markdown. Code execution is available for all major compiled and interpreted languages.',
  },
  {
    q: 'Is my code secure?',
    a: 'Absolutely. All code is executed in isolated sandboxed containers. We use end-to-end encryption for collaboration, and your private projects are never shared or used for AI training.',
  },
  {
    q: 'Can I use CodeSphere AI offline?',
    a: 'Yes! CodeSphere AI is a Progressive Web App (PWA). Install it on your desktop or mobile device and continue coding offline. Your changes sync automatically when you\'re back online.',
  },
  {
    q: 'How does the AI assistant work?',
    a: 'Our AI assistant can explain code, find bugs, optimize performance, generate tests, write documentation, and more. It understands your entire project context and provides intelligent suggestions.',
  },
  {
    q: 'Is there a free tier?',
    a: 'Yes! Our Starter plan is completely free with 5 projects, 10 daily executions, and basic AI access. Perfect for learning, prototyping, and personal projects.',
  },
];
