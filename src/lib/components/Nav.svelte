<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { to: '/', label: 'Index', num: '00' },
    { to: '/services', label: 'Services', num: '01' },
    { to: '/regions', label: 'Regions', num: '02' },
    { to: '/process', label: 'Process', num: '03' },
    { to: '/contact', label: 'Contact', num: '04' },
  ];
</script>

<header class="sticky top-0 z-40 bg-background/85 backdrop-blur-lg border-b border-border">
  <div class="mx-auto max-w-[1400px] px-6 h-16 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-3">
    <a href="/" class="flex items-center gap-3 group min-w-0">
      <span class="inline-block h-2.5 w-2.5 rotate-45 bg-accent group-hover:rotate-[135deg] [transition:transform_300ms_cubic-bezier(0.16,1,0.3,1)]"></span>
      <span class="font-serif text-xl leading-none truncate">Rockwell</span>
      <span class="hidden sm:inline text-[10px] text-muted-foreground font-mono uppercase tracking-[0.25em]">
        Site Surveys · IE
      </span>
    </a>

    <nav class="hidden md:flex items-center justify-center gap-1 text-xs font-mono uppercase tracking-[0.2em]">
      {#each links as l}
        {@const isActive = l.to === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(l.to)}
        <a
          href={l.to}
          class="px-3 py-2 rounded-sm hover:text-foreground transition-colors flex items-center gap-2 {isActive ? 'text-foreground bg-secondary' : 'text-muted-foreground'}"
        >
          <span class="text-accent">{l.num}</span>
          {l.label}
        </a>
      {/each}
    </nav>

    <div class="flex items-center justify-end gap-2">
      <a
        href="/contact"
        class="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] bg-primary text-primary-foreground px-4 py-2.5 rounded-full hover:bg-accent hover:text-accent-foreground transition active:scale-[0.97]"
      >
        Request survey
        <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</header>
