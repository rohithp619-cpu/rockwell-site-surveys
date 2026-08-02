<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { MessageSquare } from 'lucide-svelte';

  let chatOpened = $state(browser ? !!localStorage.getItem('rockwell:chat-opened') : false);

  function markOpened() {
    if (browser) localStorage.setItem('rockwell:chat-opened', '1');
    chatOpened = true;
  }
</script>

{#if !$page.url.pathname.startsWith('/chat')}
  <a
    href="/chat"
    onclick={markOpened}
    aria-label="Open survey desk chat"
    class="group pill fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 bg-primary text-primary-foreground pl-3 pr-5 py-2.5 shadow-[0_24px_60px_-20px_oklch(0.19_0.005_260/0.6)] hover:bg-accent hover:text-accent-foreground fade-in"
  >
    <span class="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
      <MessageSquare class="h-4 w-4" />
      {#if !chatOpened}
        <span class="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[--rust] ring-2 ring-primary group-hover:ring-accent transition-[box-shadow]"></span>
      {/if}
    </span>
    <span class="hidden sm:flex flex-col leading-tight">
      <span class="text-[9px] font-mono uppercase tracking-[0.28em] opacity-70">Survey desk</span>
      <span class="text-sm font-medium">Ask an engineer</span>
    </span>
  </a>
{/if}
