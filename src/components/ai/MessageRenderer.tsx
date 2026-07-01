/* ============================================
   MessageRenderer.tsx — Markdown + Syntax Highlighting
   No external deps: pure React/CSS implementation
   ============================================ */
import { memo } from 'react';

/* ---- Token types for syntax highlighting ---- */
type Token = { type: 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'function' | 'plain'; value: string };

const KEYWORDS: Record<string, string[]> = {
  default: ['if', 'else', 'for', 'while', 'return', 'const', 'let', 'var', 'function', 'class', 'import', 'export', 'from', 'async', 'await', 'new', 'try', 'catch', 'throw', 'typeof', 'instanceof', 'null', 'undefined', 'true', 'false', 'this', 'super', 'extends', 'implements', 'interface', 'type', 'enum', 'in', 'of', 'default', 'switch', 'case', 'break', 'continue', 'delete', 'void', 'static', 'readonly'],
  python: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'raise', 'yield', 'lambda', 'pass', 'break', 'continue', 'not', 'and', 'or', 'in', 'is', 'True', 'False', 'None', 'async', 'await', 'del', 'global', 'nonlocal'],
  rust: ['fn', 'let', 'mut', 'pub', 'struct', 'enum', 'impl', 'trait', 'use', 'mod', 'if', 'else', 'for', 'while', 'loop', 'match', 'return', 'self', 'Self', 'where', 'type', 'const', 'static', 'move', 'async', 'await', 'true', 'false', 'Some', 'None', 'Ok', 'Err'],
  go: ['func', 'var', 'type', 'struct', 'interface', 'if', 'else', 'for', 'range', 'return', 'package', 'import', 'go', 'chan', 'select', 'case', 'default', 'defer', 'map', 'make', 'new', 'nil', 'true', 'false', 'switch', 'break', 'continue', 'fallthrough', 'goto'],
};

function tokenize(code: string, lang: string): Token[] {
  const kws = new Set([...(KEYWORDS[lang] ?? []), ...(KEYWORDS.default)]);
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Single-line comment
    if ((code[i] === '/' && code[i + 1] === '/') || (lang === 'python' && code[i] === '#')) {
      const end = code.indexOf('\n', i);
      const value = end === -1 ? code.slice(i) : code.slice(i, end + 1);
      tokens.push({ type: 'comment', value });
      i += value.length;
      continue;
    }
    // Multi-line comment
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const value = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ type: 'comment', value });
      i += value.length;
      continue;
    }
    // String literal (", ', `, """)
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++; // escape
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // Number
    if (/[0-9]/.test(code[i]) || (code[i] === '.' && /[0-9]/.test(code[i + 1] ?? ''))) {
      let j = i;
      while (j < code.length && /[0-9._xXa-fA-F]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }
    // Word (keyword / function / plain)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      // Check if followed by ( → function call
      const nextNonSpace = code.slice(j).trimStart();
      const type: Token['type'] = kws.has(word)
        ? 'keyword'
        : nextNonSpace.startsWith('(')
          ? 'function'
          : 'plain';
      tokens.push({ type, value: word });
      i = j;
      continue;
    }
    // Operator
    if (/[=+\-*/<>!&|^~%?:,;.]/.test(code[i])) {
      tokens.push({ type: 'operator', value: code[i] });
      i++;
      continue;
    }
    // Everything else (brackets, whitespace)
    tokens.push({ type: 'plain', value: code[i] });
    i++;
  }
  return tokens;
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const tokens = tokenize(code, lang || 'default');
  return (
    <div className="md-code-block">
      {lang && <div className="md-code-lang">{lang}</div>}
      <pre className="md-code-pre">
        <code>
          {tokens.map((tok, i) => (
            <span key={i} className={`tok tok-${tok.type}`}>{tok.value}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/* ---- Inline text renderer ---- */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Matches: **bold**, *italic*, `inline code`, [link](url)
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
    else if (m[4]) parts.push(<code key={m.index} className="md-inline-code">{m[4]}</code>);
    else if (m[5]) parts.push(<a key={m.index} href={m[6]} target="_blank" rel="noreferrer" className="md-link">{m[5]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/* ---- Line-level block renderer ---- */
function renderLines(lines: string[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
      result.push(<Tag key={i} className={`md-h${level}`}>{renderInline(headingMatch[2])}</Tag>);
      i++;
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      result.push(<hr key={i} className="md-hr" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      result.push(<blockquote key={i} className="md-blockquote">{renderLines(quoteLines)}</blockquote>);
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        listItems.push(<li key={i}>{renderInline(lines[i].slice(2))}</li>);
        i++;
      }
      result.push(<ul key={`ul-${i}`} className="md-ul">{listItems}</ul>);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const match = lines[i].match(/^\d+\.\s(.+)$/);
        listItems.push(<li key={i}>{renderInline(match?.[1] ?? '')}</li>);
        i++;
      }
      result.push(<ol key={`ol-${i}`} className="md-ol">{listItems}</ol>);
      continue;
    }

    // Table (| ... | ... |)
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split('|').filter(Boolean).map(c => c.trim());
        const rows = tableLines.slice(2).map(r => r.split('|').filter(Boolean).map(c => c.trim()));
        result.push(
          <div key={`tbl-${i}`} className="md-table-wrap">
            <table className="md-table">
              <thead><tr>{headers.map((h, j) => <th key={j}>{renderInline(h)}</th>)}</tr></thead>
              <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{renderInline(cell)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Empty line
    if (!line.trim()) {
      result.push(<div key={i} className="md-spacer" />);
      i++;
      continue;
    }

    // Regular paragraph
    result.push(<p key={i} className="md-p">{renderInline(line)}</p>);
    i++;
  }
  return result;
}

/* ---- Main renderer ---- */
export const MessageRenderer = memo(function MessageRenderer({ content }: { content: string }) {
  const nodes: React.ReactNode[] = [];
  const codeBlockRe = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = codeBlockRe.exec(content)) !== null) {
    if (m.index > last) {
      const textSegment = content.slice(last, m.index);
      nodes.push(
        <div key={key++} className="md-text-segment">
          {renderLines(textSegment.split('\n'))}
        </div>
      );
    }
    nodes.push(<CodeBlock key={key++} lang={m[1].toLowerCase()} code={m[2].trimEnd()} />);
    last = m.index + m[0].length;
  }

  if (last < content.length) {
    nodes.push(
      <div key={key++} className="md-text-segment">
        {renderLines(content.slice(last).split('\n'))}
      </div>
    );
  }

  return <div className="message-renderer">{nodes}</div>;
});
