<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import { loadThread, saveMessages, type ChatMessage } from '$lib/chat-storage';

  marked.setOptions({ breaks: true });

  let {
    threadId,
    initialMessage = null,
  }: { threadId: string; initialMessage?: string | null } = $props();

  let messages = $state<ChatMessage[]>([]);
  let inputText = $state('');
  let streaming = $state('');
  let status = $state<'idle' | 'loading' | 'streaming' | 'error'>('idle');
  let errorMsg = $state('');
  let viewport: HTMLDivElement | undefined = $state();

  const busy = $derived(status === 'loading' || status === 'streaming');

  onMount(() => {
    const thread = loadThread(threadId);
    if (thread) messages = thread.messages;
    if (initialMessage && messages.length === 0) {
      send(initialMessage);
    }
  });

  $effect(() => {
    // track reactive dependencies
    const _ = messages.length + streaming.length;
    if (viewport) {
      requestAnimationFrame(() => {
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      });
    }
  });

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    messages = [...messages, userMsg];
    inputText = '';
    status = 'loading';
    streaming = '';
    errorMsg = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      status = 'streaming';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streaming += decoder.decode(value, { stream: true });
      }

      const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: streaming };
      messages = [...messages, assistantMsg];
      streaming = '';
      status = 'idle';
      saveMessages(threadId, messages);
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'The survey desk hit a snag. Try again.';
      status = 'error';
      streaming = '';
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(inputText);
    }
  }
</script>

<div class="flex-1 flex flex-col min-h-0 overflow-hidden">
  <!-- Conversation -->
  <div bind:this={viewport} class="flex-1 overflow-y-auto">
    <div class="mx-auto w-full max-w-3xl px-6 py-8 space-y-6">
      {#if messages.length === 0 && status === 'idle'}
        <div class="text-center py-20 fade-in">
          <p class="text-xs font-mono uppercase tracking-[0.3em] text-accent">Ready</p>
          <h2 class="mt-4 font-serif text-4xl">Ask the survey desk.</h2>
          <p class="mt-3 text-sm text-muted-foreground max-w-xs mx-auto">
            Describe your site, defect, or planning requirement.
          </p>
        </div>
      {/if}

      {#each messages as msg (msg.id)}
        <div class="flex flex-col gap-1 fade-in {msg.role === 'user' ? 'items-end' : 'items-start'}">
          <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground px-1">
            {msg.role === 'user' ? 'You' : 'Rockwell AI'}
          </span>
          {#if msg.role === 'user'}
            <div class="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed bg-primary text-primary-foreground" style="white-space: pre-wrap">
              {msg.content}
            </div>
          {:else}
            <div class="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-card border border-border text-foreground chat-prose">
              {@html marked(msg.content)}
            </div>
          {/if}
        </div>
      {/each}

      {#if status === 'loading'}
        <div class="flex flex-col gap-1 items-start fade-in">
          <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground px-1">Rockwell AI</span>
          <div class="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
            <span class="flex gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0ms]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:150ms]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:300ms]"></span>
            </span>
            <span class="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">Consulting the drawings…</span>
          </div>
        </div>
      {/if}

      {#if status === 'streaming' && streaming}
        <div class="flex flex-col gap-1 items-start">
          <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground px-1">Rockwell AI</span>
          <div class="max-w-[85%] bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm chat-prose">
            {@html marked(streaming)}<span class="inline-block w-0.5 h-[1em] bg-accent ml-0.5 animate-pulse align-middle"></span>
          </div>
        </div>
      {/if}

      {#if status === 'error'}
        <div class="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      {/if}
    </div>
  </div>

  <!-- Input bar -->
  <div class="border-t border-border bg-background/80 backdrop-blur-sm shrink-0">
    <div class="mx-auto w-full max-w-3xl px-6 py-4">
      <div class="rounded-2xl border border-border bg-card shadow-[0_20px_60px_-30px_oklch(0.16_0.02_250/0.2)] focus-within:border-accent transition-colors duration-200">
        <textarea
          bind:value={inputText}
          onkeydown={handleKeyDown}
          placeholder="Describe the site, defect, or brief…"
          rows={2}
          disabled={busy}
          class="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm placeholder:text-muted-foreground outline-none disabled:opacity-50"
        ></textarea>
        <div class="flex items-center justify-between px-4 pb-3 pt-1">
          <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            Rockwell AI · indicative guidance only
          </span>
          <button
            onclick={() => send(inputText)}
            disabled={!inputText.trim() || busy}
            class="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] transition active:scale-[0.97] hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:pointer-events-none"
          >
            {busy ? 'Thinking…' : 'Send →'}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
