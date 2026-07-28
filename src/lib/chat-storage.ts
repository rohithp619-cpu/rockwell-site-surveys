export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

const KEY = 'rockwell.chat.threads.v1';

function safeRead(): ChatThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatThread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(threads: ChatThread[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(threads));
    window.dispatchEvent(new CustomEvent('rockwell:threads'));
  } catch {
    // ignore quota errors
  }
}

export function loadThreads(): ChatThread[] {
  return safeRead().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function loadThread(id: string): ChatThread | undefined {
  return safeRead().find((t) => t.id === id);
}

export function saveMessages(id: string, messages: ChatMessage[]) {
  const all = safeRead();
  const existing = all.find((t) => t.id === id);
  const title = titleFromMessages(messages) ?? existing?.title ?? 'New survey brief';
  const next: ChatThread = { id, title, updatedAt: Date.now(), messages };
  safeWrite([next, ...all.filter((t) => t.id !== id)]);
}

export function deleteThread(id: string) {
  safeWrite(safeRead().filter((t) => t.id !== id));
}

export function newThreadId(): string {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function titleFromMessages(messages: ChatMessage[]): string | undefined {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return undefined;
  const text = first.content.trim();
  return text ? (text.length > 48 ? `${text.slice(0, 48)}…` : text) : undefined;
}
