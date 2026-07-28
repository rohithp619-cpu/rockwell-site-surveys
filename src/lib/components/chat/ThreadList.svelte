<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Plus, MessageSquare, Trash2 } from 'lucide-svelte';
  import { loadThreads, deleteThread, newThreadId, type ChatThread } from '$lib/chat-storage';

  let threads = $state<ChatThread[]>([]);

  onMount(() => {
    threads = loadThreads();
    const refresh = () => { threads = loadThreads(); };
    window.addEventListener('rockwell:threads', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('rockwell:threads', refresh);
      window.removeEventListener('storage', refresh);
    };
  });

  function startNew() {
    goto(`/chat/${newThreadId()}`);
  }

  function remove(e: MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    deleteThread(id);
    threads = loadThreads();
    if (id === $page.params.threadId) goto('/chat');
  }

  function formatWhen(ts: number) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(ts).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' });
  }
</script>

<aside class="h-full flex flex-col bg-secondary/40 border-r border-border overflow-hidden">
  <!-- New chat -->
  <div class="p-4 border-b border-border shrink-0">
    <button
      onclick={startNew}
      class="w-full inline-flex items-center justify-between gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 text-[11px] font-mono uppercase tracking-[0.22em] hover:bg-accent hover:text-accent-foreground transition active:scale-[0.97]"
    >
      <span class="flex items-center gap-2">
        <Plus class="h-3.5 w-3.5" /> New chat
      </span>
      <span class="opacity-50 text-xs">⌘K</span>
    </button>
  </div>

  <!-- History label -->
  <div class="px-4 pt-4 pb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground flex items-center justify-between shrink-0">
    <span>History</span>
    <span class="text-accent">{String(threads.length).padStart(2, '0')}</span>
  </div>

  <!-- Thread list -->
  <nav class="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
    {#if threads.length === 0}
      <p class="px-3 py-6 text-xs text-muted-foreground italic leading-relaxed">
        No previous chats. Start a new brief to talk to the survey desk.
      </p>
    {/if}

    {#each threads as t (t.id)}
      {@const active = t.id === $page.params.threadId}
      <div class="group relative">
        <a
          href="/chat/{t.id}"
          class="block rounded-md px-3 py-2.5 pr-9 transition-colors border {active
            ? 'bg-background border-border shadow-sm'
            : 'border-transparent hover:bg-background/60'}"
        >
          <div class="flex items-start gap-2">
            <MessageSquare class="h-3.5 w-3.5 mt-0.5 shrink-0 {active ? 'text-accent' : 'text-muted-foreground'}" />
            <div class="min-w-0">
              <div class="truncate text-sm leading-snug">{t.title}</div>
              <div class="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-1">
                {formatWhen(t.updatedAt)}
              </div>
            </div>
          </div>
        </a>
        <button
          onclick={(e) => remove(e, t.id)}
          aria-label="Delete chat"
          class="absolute top-2.5 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>
    {/each}
  </nav>

  <!-- Footer -->
  <div class="p-4 border-t border-border text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground shrink-0">
    Rockwell · Survey desk
  </div>
</aside>
