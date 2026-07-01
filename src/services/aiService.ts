/* ============================================
   AI Service — streaming completions
   Supports: OpenAI · OpenRouter · Gemini · Mock
   Configure via .env (VITE_OPENAI_API_KEY, etc.)
   ============================================ */

export type AIMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onComplete: () => void;
  onError: (err: string) => void;
}

/* ---- Provider detection ---- */
function detectProvider(): 'openai' | 'openrouter' | 'gemini' | 'mock' {
  if (import.meta.env.VITE_OPENAI_API_KEY) return 'openai';
  if (import.meta.env.VITE_OPENROUTER_API_KEY) return 'openrouter';
  if (import.meta.env.VITE_GEMINI_API_KEY) return 'gemini';
  return 'mock';
}

/* ============================================
   MAIN ENTRY POINT
   ============================================ */
export async function streamAIResponse(
  messages: AIMessage[],
  callbacks: StreamCallbacks,
): Promise<void> {
  const provider = detectProvider();
  try {
    if (provider === 'openai') {
      await streamOpenAI(messages, callbacks, 'https://api.openai.com/v1/chat/completions', import.meta.env.VITE_OPENAI_API_KEY, import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4o');
    } else if (provider === 'openrouter') {
      await streamOpenAI(messages, callbacks, 'https://openrouter.ai/api/v1/chat/completions', import.meta.env.VITE_OPENROUTER_API_KEY, import.meta.env.VITE_OPENROUTER_MODEL ?? 'openai/gpt-4o');
    } else if (provider === 'gemini') {
      await streamGemini(messages, callbacks);
    } else {
      await streamMock(messages, callbacks);
    }
  } catch (err: any) {
    callbacks.onError(err?.message ?? 'Unknown error occurred');
  }
}

/* ============================================
   OPENAI / OPENROUTER (SSE streaming)
   ============================================ */
async function streamOpenAI(
  messages: AIMessage[],
  { onChunk, onComplete, onError }: StreamCallbacks,
  endpoint: string,
  apiKey: string,
  model: string,
): Promise<void> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://codesphere.ai',
      'X-Title': 'CodeSphere AI',
    },
    body: JSON.stringify({ model, messages, stream: true, temperature: 0.7 }),
  });

  if (!res.ok) {
    const err = await res.text();
    onError(`API error ${res.status}: ${err}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) { onError('No response body'); return; }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(trimmed.slice(6));
        const chunk = json.choices?.[0]?.delta?.content ?? '';
        if (chunk) onChunk(chunk);
      } catch { /* skip malformed */ }
    }
  }
  onComplete();
}

/* ============================================
   GEMINI REST API (streaming)
   ============================================ */
async function streamGemini(
  messages: AIMessage[],
  { onChunk, onComplete, onError }: StreamCallbacks,
): Promise<void> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const model = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-1.5-flash';

  // Convert messages to Gemini format
  const systemMsg = messages.find(m => m.role === 'system');
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

  const body: any = { contents };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    onError(`Gemini error ${res.status}: ${err}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) { onError('No response body'); return; }
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(trimmed.slice(6));
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (text) onChunk(text);
      } catch { /* skip */ }
    }
  }
  onComplete();
}

/* ============================================
   MOCK STREAMING (no API key)
   ============================================ */
const MOCK_RESPONSES: Record<string, string> = {
  explain: `## Code Explanation

This code implements a **recursive algorithm** that traverses the data structure and applies transformations at each node.

### How it works:

1. **Base case** — Returns immediately when the input is null or empty, preventing infinite recursion
2. **Recursive step** — Processes each child node by calling itself with reduced scope
3. **Accumulation** — Results are collected and merged using the spread operator

### Complexity Analysis:
- **Time**: O(n log n) — each element is visited once per depth level
- **Space**: O(n) — the call stack grows proportionally to input size

\`\`\`typescript
// The key insight is this pattern:
function process(node: Node): Result {
  if (!node) return base;           // base case
  const children = node.children   
    .map(child => process(child));  // recursive step
  return merge(node.value, children); // accumulation
}
\`\`\`

### Potential edge cases to watch:
- Empty array inputs → handled by the null check on line 1
- Circular references → would cause a stack overflow; consider adding a visited set
- Very deep nesting → may hit the JS call stack limit (~10,000 frames)`,

  debug: `## Debug Analysis

I've analyzed the code and found **3 potential issues**:

### 🔴 Critical — Null Pointer Dereference
\`\`\`javascript
// BEFORE (unsafe):
const value = obj.data.items[0].name;

// AFTER (safe):
const value = obj?.data?.items?.[0]?.name ?? 'default';
\`\`\`

### 🟡 Warning — Race Condition
The async operations are running in parallel without proper synchronization:
\`\`\`javascript
// BEFORE:
await fetchUser();
await fetchPosts(); // runs sequentially but could be concurrent

// AFTER (faster):
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
\`\`\`

### 🟢 Info — Memory Leak
Event listeners are added but never removed:
\`\`\`javascript
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler); // add this!
}, []);
\`\`\`

All three issues should be addressed before deploying to production.`,

  optimize: `## Optimization Suggestions

### Performance Improvements

**1. Memoize expensive computations**
\`\`\`javascript
// Replace direct computation with useMemo
const sortedItems = useMemo(
  () => items.sort((a, b) => a.value - b.value),
  [items] // only recompute when items changes
);
\`\`\`

**2. Replace O(n²) lookup with O(1) hash map**
\`\`\`javascript
// BEFORE — O(n) per lookup:
const found = array.find(item => item.id === targetId);

// AFTER — O(1) lookup:
const lookup = new Map(array.map(item => [item.id, item]));
const found = lookup.get(targetId);
\`\`\`

**3. Debounce rapid-fire events**
\`\`\`javascript
const handleSearch = useCallback(
  debounce((query: string) => {
    performSearch(query);
  }, 300),
  []
);
\`\`\`

### Estimated Impact
- 🚀 **60-80% reduction** in render time with memoization
- 🚀 **O(n) → O(1)** lookup performance
- 🚀 **~70% fewer** API calls with debouncing`,

  docs: `## Generated Documentation

\`\`\`typescript
/**
 * Processes a collection of items and applies the specified transformation.
 * 
 * @param items - The array of items to process. Must be non-null.
 * @param transform - A function that transforms each item.
 *   Receives the item and its index; returns the transformed result.
 * @param options - Optional configuration object
 * @param options.parallel - If true, processes items concurrently (default: false)
 * @param options.timeout - Maximum milliseconds to wait per item (default: 5000)
 * 
 * @returns A Promise resolving to an array of transformed results,
 *   maintaining the same order as the input array.
 * 
 * @throws {ValidationError} If \`items\` is null or not an array
 * @throws {TimeoutError} If any transformation exceeds the timeout
 * 
 * @example
 * const results = await processItems(
 *   [{ id: 1 }, { id: 2 }],
 *   async (item) => fetchDetails(item.id),
 *   { parallel: true, timeout: 3000 }
 * );
 * 
 * @since 2.1.0
 * @see {@link BatchProcessor} for processing very large collections
 */
\`\`\``,

  tests: `## Generated Unit Tests

\`\`\`typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  const mockProps = {
    data: [{ id: 1, name: 'Test Item' }],
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<YourComponent {...mockProps} />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays all items', () => {
      render(<YourComponent {...mockProps} />);
      expect(screen.getByText('Test Item')).toBeVisible();
    });

    it('shows empty state when no data', () => {
      render(<YourComponent {...mockProps} data={[]} />);
      expect(screen.getByText(/no items/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onSelect when item is clicked', () => {
      render(<YourComponent {...mockProps} />);
      fireEvent.click(screen.getByText('Test Item'));
      expect(mockProps.onSelect).toHaveBeenCalledWith(mockProps.data[0]);
      expect(mockProps.onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('handles null items gracefully', () => {
      expect(() => render(<YourComponent {...mockProps} data={null as any} />))
        .not.toThrow();
    });
  });
});
\`\`\``,

  refactor: `## Refactoring Suggestions

### Before → After

**Extract complex conditionals into named functions:**
\`\`\`typescript
// BEFORE — hard to read:
if (user && user.role === 'admin' && !user.suspended && user.verified) {
  // ...
}

// AFTER — self-documenting:
const isActiveAdmin = (user: User) =>
  user?.role === 'admin' && !user.suspended && user.verified;

if (isActiveAdmin(user)) {
  // ...
}
\`\`\`

**Apply the Single Responsibility Principle:**
\`\`\`typescript
// BEFORE — one function doing too much:
async function handleSubmit(data: FormData) {
  validateData(data);
  const formatted = formatData(data);
  await saveToDatabase(formatted);
  sendEmailNotification(formatted);
  updateUI();
}

// AFTER — composed pipeline:
async function handleSubmit(data: FormData) {
  const validated = validate(data);           // pure
  const formatted = format(validated);        // pure
  const saved = await persist(formatted);     // side effect
  await notify(saved);                        // side effect
  return saved;                               // UI updates reactively
}
\`\`\`

**Replace magic numbers with named constants:**
\`\`\`typescript
const RATE_LIMIT_MS = 300;
const MAX_RETRIES = 3;
const PAGE_SIZE = 25;
\`\`\``,

  translate: `## Code Translation

Here's the code translated to **Python**:

\`\`\`python
from typing import Optional, List, TypeVar, Callable
from dataclasses import dataclass
import asyncio

T = TypeVar('T')
R = TypeVar('R')

async def process_items(
    items: List[T],
    transform: Callable[[T], R],
    parallel: bool = False,
    timeout: float = 5.0
) -> List[R]:
    """
    Process a list of items with the given transform function.
    
    Args:
        items: List of items to process
        transform: Transformation function to apply
        parallel: If True, processes items concurrently
        timeout: Maximum seconds to wait per item
        
    Returns:
        List of transformed results in original order
    """
    if parallel:
        tasks = [
            asyncio.wait_for(
                asyncio.coroutine(transform)(item), 
                timeout=timeout
            )
            for item in items
        ]
        return await asyncio.gather(*tasks)
    
    results = []
    for item in items:
        result = await asyncio.wait_for(transform(item), timeout)
        results.append(result)
    return results
\`\`\`

**Key differences from TypeScript:**
- Python uses \`async/await\` with \`asyncio\` instead of native Promises
- Type hints use the \`typing\` module (or built-in generics in Python 3.10+)
- \`Promise.all\` → \`asyncio.gather\`
- Interfaces → \`@dataclass\` or \`TypedDict\``,

  general: `## CodeSphere AI Response

I'm here to help you write better code! Here are some ways I can assist:

| Action | What I do |
|--------|-----------|
| **Explain** | Break down what code does step by step |
| **Debug** | Find bugs and suggest fixes |
| **Optimize** | Improve performance and efficiency |
| **Docs** | Generate JSDoc/docstring documentation |
| **Tests** | Write comprehensive unit tests |
| **Refactor** | Improve code structure and readability |
| **Translate** | Convert code to another language |

**Select some code in the editor** and use the quick actions, or just ask me anything!

\`\`\`javascript
// Example: I can help with code like this
const fibonacci = (n) => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);
// → I'll suggest memoization to make it O(n) instead of O(2^n)
\`\`\``,
};

function detectActionFromMessage(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes('explain') || lower.includes('what does') || lower.includes('how does')) return 'explain';
  if (lower.includes('debug') || lower.includes('bug') || lower.includes('error') || lower.includes('fix')) return 'debug';
  if (lower.includes('optim') || lower.includes('faster') || lower.includes('performance')) return 'optimize';
  if (lower.includes('document') || lower.includes('jsdoc') || lower.includes('comment')) return 'docs';
  if (lower.includes('test') || lower.includes('spec') || lower.includes('unit')) return 'tests';
  if (lower.includes('refactor') || lower.includes('clean') || lower.includes('restructure')) return 'refactor';
  if (lower.includes('translat') || lower.includes('convert') || lower.includes('python') || lower.includes('rust') || lower.includes('java')) return 'translate';
  return 'general';
}

async function streamMock(
  messages: AIMessage[],
  { onChunk, onComplete }: StreamCallbacks,
): Promise<void> {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const action = detectActionFromMessage(lastUserMsg?.content ?? '');
  const response = MOCK_RESPONSES[action] ?? MOCK_RESPONSES.general;

  // Stream character by character with variable speed for natural feel
  const CHUNK_SIZE = 4;
  const DELAY_MS = 18;

  for (let i = 0; i < response.length; i += CHUNK_SIZE) {
    const chunk = response.slice(i, i + CHUNK_SIZE);
    onChunk(chunk);
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
  onComplete();
}
