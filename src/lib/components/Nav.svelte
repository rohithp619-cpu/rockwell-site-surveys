<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import Logo from '$lib/assets/logo.svg?raw';

  const links = [
    { to: '/', label: 'Overview', exact: true },
    { to: '/services', label: 'Surveys', exact: false },
    { to: '/regions', label: 'Coverage', exact: false },
    { to: '/offers', label: 'Offers', exact: false },
    { to: '/process', label: 'Process', exact: false },
    { to: '/chat', label: 'Ask AI', exact: false },
    { to: '/contact', label: 'Contact', exact: false },
  ];

  let scrolled = $state(false);
  let mobileOpen = $state(false);
  let weatherChip = $state<string | null>(null);

  onMount(async () => {
    const res = await fetch('/api/weather').catch(() => null);
    if (res?.ok) {
      const d = await res.json();
      const wmo: Record<number, string> = {
        0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',
        51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',
        71:'🌨️',73:'🌨️',75:'🌨️',80:'🌦️',81:'🌦️',82:'🌦️',
        95:'⛈️',96:'⛈️',99:'⛈️',
      };
      const emoji = wmo[d.current.weather_code] ?? '🌡️';
      weatherChip = `${emoji} ${d.current.temperature_2m.toFixed(0)}°C`;
    }
  });

  $effect(() => {
    if (!browser) return;
    const onScroll = () => (scrolled = window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  function isActive(to: string, exact: boolean) {
    const path = $page.url.pathname;
    return exact ? path === to : path.startsWith(to);
  }
</script>

<header class="sticky top-0 z-50 glass transition-shadow duration-500 {scrolled ? 'shadow-[0_1px_0_0_var(--border)]' : ''}">
  <div class="mx-auto max-w-[1024px] px-6 h-16 flex items-center justify-between gap-6">
    <a href="/" class="group flex items-center gap-2.5 shrink-0" aria-label="Rockwell Site Surveys — home">
      <span class="h-11 w-11 shrink-0 [transition:transform_700ms_ease-out] group-hover:[transform:rotate(90deg)]">{@html Logo}</span>
      <span class="text-[22px] font-semibold tracking-tight leading-none">Rockwell</span>
    </a>

    <nav class="hidden md:flex items-center gap-1 text-[12px]">
      {#each links as l}
        <a
          href={l.to}
          class="px-3 py-1.5 rounded-full transition-colors duration-300 {isActive(l.to, l.exact) ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}"
        >
          {l.label}
        </a>
      {/each}
    </nav>

    <div class="flex items-center gap-2">
      {#if weatherChip}
        <a
          href="/chat"
          title="Current Dublin weather — click to ask the survey desk"
          class="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-200"
        >
          {weatherChip}
        </a>
      {/if}
      <a
        href="/contact"
        class="pill hidden sm:inline-flex items-center bg-accent text-accent-foreground px-4 py-1.5 text-[12px] font-medium"
      >
        Request a survey
      </a>
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
        onclick={() => (mobileOpen = !mobileOpen)}
        class="md:hidden h-8 w-8 grid place-items-center rounded-full hover:bg-secondary transition-colors"
      >
        <span class="relative block h-3 w-4">
          <span class="absolute left-0 h-px w-4 bg-foreground transition-transform duration-300 {mobileOpen ? 'top-1.5 rotate-45' : 'top-0.5'}"></span>
          <span class="absolute left-0 h-px w-4 bg-foreground transition-transform duration-300 {mobileOpen ? 'top-1.5 -rotate-45' : 'top-2.5'}"></span>
        </span>
      </button>
    </div>
  </div>

  <div class="md:hidden overflow-hidden border-t border-border/60 transition-[max-height,opacity] duration-500 ease-out {mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}">
    <nav class="mx-auto max-w-[1024px] px-6 py-3 grid gap-1 text-sm">
      {#each links as l}
        <a
          href={l.to}
          onclick={() => (mobileOpen = false)}
          class="py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {l.label}
        </a>
      {/each}
    </nav>
  </div>
</header>
