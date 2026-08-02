<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import { loadThread, saveMessages, type ChatMessage } from '$lib/chat-storage';
  import SurveyContextBar from '$lib/components/chat/SurveyContextBar.svelte';

  marked.setOptions({ breaks: true });

  // Suitability readout pattern: "✗ Drone · ✓ Struct · ✓ Geo"
  const SUIT_RE = /^([✗✓⚠]) Drone · ([✗✓⚠]) Struct · ([✗✓⚠]) Geo$/m;

  function suitPill(sym: string, label: string, type: 'drone' | 'struct' | 'geo'): string {
    const color = sym === '✓' ? '#22c55e' : sym === '⚠' ? '#eab308' : '#ef4444';
    const emoji =
      sym === '✓'
        ? { drone: '🛸', struct: '🏗️', geo: '⛏️' }[type]
        : sym === '⚠'
          ? '⚠️'
          : { drone: '🚫', struct: '🏚️', geo: '❌' }[type];
    return `<span style="color:${color};font-weight:600;font-family:monospace;white-space:nowrap">${emoji} ${sym} ${label}</span>`;
  }

  function renderSuitability(content: string): string {
    return content.replace(SUIT_RE, (_, drone, struct, geo) =>
      `<div style="display:flex;align-items:center;gap:12px;margin:6px 0;line-height:1.4">` +
        suitPill(drone, 'Drone', 'drone') +
        `<span style="color:var(--muted-foreground);opacity:0.5">·</span>` +
        suitPill(struct, 'Struct', 'struct') +
        `<span style="color:var(--muted-foreground);opacity:0.5">·</span>` +
        suitPill(geo, 'Geo', 'geo') +
      `</div>`
    );
  }

  function render(content: string): string {
    return marked(renderSuitability(content)) as string;
  }

  let {
    threadId,
    initialMessage = null,
    surveyId = null,
    surveyName = null,
    surveyRegion = null,
  }: {
    threadId: string;
    initialMessage?: string | null;
    surveyId?: string | null;
    surveyName?: string | null;
    surveyRegion?: string | null;
  } = $props();

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
    const _ = messages.length + streaming.length;
    if (viewport) {
      requestAnimationFrame(() => {
        if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
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
          surveyId: surveyId ?? null,
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

  <!-- Live data bar — always visible, outside scroll, shows survey context when available -->
  <SurveyContextBar
    {surveyId}
    surveyName={surveyName ?? ''}
    region={surveyRegion ?? 'Dublin'}
  />

  <!-- Conversation -->
  <div bind:this={viewport} class="flex-1 overflow-y-auto">
    <div class="mx-auto w-full max-w-3xl px-6 py-8 space-y-6">

      {#if messages.length === 0 && status === 'idle'}
        <div class="text-center py-10 fade-in">
          <p class="text-xs font-mono uppercase tracking-[0.3em] text-accent">Ready</p>
          <h2 class="mt-4 font-serif text-4xl">Ask the survey desk.</h2>
          <p class="mt-3 text-sm text-muted-foreground max-w-xs mx-auto">
            {#if surveyId}
              Your brief about <strong>{surveyId}</strong> is on the way. Continue the conversation below.
            {:else}
              Describe your site, defect, or planning requirement.
            {/if}
          </p>
        </div>
      {/if}

      {#each messages as msg (msg.id)}
        <div class="flex flex-col gap-1 msg-appear {msg.role === 'user' ? 'items-end' : 'items-start'}">
          <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground px-1">
            {msg.role === 'user' ? 'You' : 'Rockwell AI'}
          </span>
          {#if msg.role === 'user'}
            <div class="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed bg-primary text-primary-foreground" style="white-space: pre-wrap">
              {msg.content}
            </div>
          {:else}
            <div class="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-card border border-border text-foreground chat-prose">
              {@html render(msg.content)}
            </div>
          {/if}
        </div>
      {/each}

      {#if status === 'loading' || (status === 'streaming' && !streaming)}
        <div class="flex flex-col gap-1 items-start fade-in">
          <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground px-1">Rockwell AI</span>
          <div class="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-3">
            <span class="flex gap-1.5 items-center">
              <span class="w-1.5 h-1.5 rounded-full bg-accent [animation:dot-pulse_1.2s_ease-in-out_infinite] [animation-delay:0ms]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-accent [animation:dot-pulse_1.2s_ease-in-out_infinite] [animation-delay:200ms]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-accent [animation:dot-pulse_1.2s_ease-in-out_infinite] [animation-delay:400ms]"></span>
            </span>
            <span class="text-xs font-mono text-muted-foreground thinking-text">Thinking…</span>
          </div>
        </div>
      {/if}

      {#if status === 'streaming' && streaming}
        <div class="flex flex-col gap-1 items-start">
          <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground px-1">Rockwell AI</span>
          <div class="max-w-[85%] bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm chat-prose">
            {@html render(streaming)}<span class="inline-block w-0.5 h-[1em] bg-accent ml-0.5 animate-pulse align-middle"></span>
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
  <div class="border-t border-border bg-background/60 backdrop-blur-sm shrink-0">
    <div class="mx-auto w-full max-w-3xl px-6 pt-4 pb-2">
      <div class="rounded-2xl border border-border bg-card shadow-[0_8px_30px_-15px_oklch(0.16_0.02_250/0.15)] focus-within:border-accent focus-within:shadow-[0_0_0_3px_oklch(0.72_0.15_55/0.15),0_20px_60px_-20px_oklch(0.16_0.02_250/0.3)] transition-[border-color,box-shadow] duration-200">
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
      <p class="mt-3 pb-3 text-[10px] leading-relaxed text-muted-foreground/60 text-center max-w-2xl mx-auto">
        You're chatting with Rockwell AI, an automated assistant that answers from our live service catalogue — it isn't a chartered engineer, and any figure or scope detail it gives you should be confirmed with our team before you rely on it for booking or safety decisions.
      </p>
    </div>
  </div>
</div>
