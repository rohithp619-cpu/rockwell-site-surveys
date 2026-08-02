<script lang="ts">
  import { onMount } from 'svelte';
  import type { SeismicData, SeismicEvent } from '$lib/seismic.server';

  let data = $state<SeismicData | null>(null);
  let error = $state(false);
  let showList = $state(true);

  onMount(async () => {
    try {
      const res = await fetch('/api/seismic');
      if (!res.ok) throw new Error();
      data = await res.json();
    } catch {
      error = true;
    }
  });

  function timeAgo(ms: number): string {
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (mins > 0) return `${mins}m`;
    return 'now';
  }

  function magColor(m: number): string {
    if (m >= 6) return '#ef4444';
    if (m >= 4.5) return '#f97316';
    if (m >= 3) return '#eab308';
    return 'var(--accent)';
  }

  function magBg(m: number): string {
    if (m >= 6) return 'bg-red-500/12 text-red-500 ring-red-500/20';
    if (m >= 4.5) return 'bg-orange-500/12 text-orange-400 ring-orange-500/20';
    if (m >= 3) return 'bg-yellow-500/12 text-yellow-500 ring-yellow-500/20';
    return 'bg-accent/10 text-accent ring-accent/20';
  }

  const maxRegional = $derived(
    data?.regional.length ? Math.max(...data.regional.map((e) => e.magnitude)) : 0
  );

  const topEvent = $derived(
    data?.regional.length
      ? [...data.regional].sort((a, b) => b.magnitude - a.magnitude)[0]
      : null
  );

  const listEvents = $derived(data?.regional.slice(0, 5) ?? []);
  const globalEvents = $derived(data?.global_significant.slice(0, 3) ?? []);

  // Seismograph waveform path — double width for seamless scroll loop
  const wavePath = $derived.by(() => {
    const events = data?.regional ?? [];
    const W = 400;
    const MID = 22;
    const sigma = 18;

    function y(x: number): number {
      const base = Math.sin(x * 0.09) * 2 + Math.cos(x * 0.037) * 1.2;
      const spikes = events.slice(0, 7).reduce((sum, e, i) => {
        const center = ((i + 0.5) / Math.max(events.length, 1)) * W;
        const amp = Math.max(0, (e.magnitude - 1)) * 6;
        const d = x - center;
        return sum + amp * Math.exp(-(d * d) / (2 * sigma * sigma));
      }, 0);
      return MID - base - spikes;
    }

    const pts: string[] = [];
    for (let x = 0; x <= W * 2; x += 3) {
      pts.push(`${x} ${y(x % W).toFixed(2)}`);
    }
    return 'M ' + pts.map((p, i) => (i === 0 ? p : 'L ' + p)).join(' ');
  });

  // Ring speed: faster for higher magnitude
  const ringDuration = $derived(maxRegional >= 5 ? 1.8 : maxRegional >= 3 ? 2.4 : 3.2);
</script>

{#if !error}
  <div class="rounded-3xl border border-border overflow-hidden fade-in seismic-card text-sm">

    <!-- Header -->
    <div class="px-5 pt-4 pb-0 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="relative flex h-1.5 w-1.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
        </span>
        <span class="text-[10px] font-mono uppercase tracking-[0.3em] text-accent">Live · USGS Seismic</span>
      </div>
      {#if data}
        <span class="text-[10px] font-mono text-muted-foreground">
          {new Date(data.fetched_at).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })} UTC
        </span>
      {:else}
        <span class="text-[10px] font-mono text-muted-foreground animate-pulse">Loading…</span>
      {/if}
    </div>

    {#if data}
      <!-- Hero: sonar rings + latest event -->
      <div class="px-5 pt-4 pb-3 flex items-center gap-5">

        <!-- Sonar pulse animation -->
        <div class="relative flex items-center justify-center shrink-0 w-[72px] h-[72px]">
          <!-- Expanding rings -->
          {#each [0, 1, 2] as i}
            <div
              class="absolute inset-0 rounded-full border seismic-ring"
              style="
                border-color: {magColor(maxRegional)};
                animation-duration: {ringDuration}s;
                animation-delay: {i * (ringDuration / 3)}s;
                opacity: {0.7 - i * 0.2};
              "
            ></div>
          {/each}

          <!-- Centre dot + magnitude -->
          <div class="relative z-10 flex flex-col items-center leading-none">
            {#if maxRegional > 0}
              <span class="text-[9px] font-mono uppercase tracking-[0.2em]" style="color: {magColor(maxRegional)}">M</span>
              <span class="text-[26px] font-bold tabular-nums -mt-0.5" style="color: {magColor(maxRegional)}">
                {maxRegional}
              </span>
            {:else}
              <span class="text-xl font-bold text-muted-foreground/30">—</span>
            {/if}
          </div>
        </div>

        <!-- Latest / top event summary -->
        <div class="min-w-0 flex-1">
          {#if topEvent}
            <p class="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              {topEvent.depth_km} km depth · {timeAgo(topEvent.time_ms)} ago
            </p>
            <p class="mt-1 text-sm font-medium leading-snug truncate">
              {topEvent.place.replace(/^\d+\s+km\s+\w+\s+of\s+/i, '')}
            </p>
            <p class="mt-1 text-[10px] font-mono text-muted-foreground">
              {data.regional.length} regional event{data.regional.length === 1 ? '' : 's'} · M1.5+
            </p>
          {:else}
            <p class="text-sm text-muted-foreground">No regional events</p>
            <p class="mt-1 text-[10px] font-mono text-muted-foreground">Baseline clear</p>
          {/if}
        </div>
      </div>

      <!-- Animated seismograph waveform strip -->
      <div class="relative mx-5 mb-4 rounded-xl overflow-hidden seismic-wave-bg" style="height: 44px">
        <svg
          viewBox="0 0 400 44"
          preserveAspectRatio="none"
          class="absolute inset-0 w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="waveEdgeFade" x1="0" x2="1">
              <stop offset="0%"   stop-color="var(--background)" stop-opacity="1" />
              <stop offset="12%"  stop-color="var(--background)" stop-opacity="0" />
              <stop offset="88%"  stop-color="var(--background)" stop-opacity="0" />
              <stop offset="100%" stop-color="var(--background)" stop-opacity="1" />
            </linearGradient>
            <mask id="waveFadeMask">
              <rect width="400" height="44" fill="white" />
              <rect width="400" height="44" fill="url(#waveEdgeFade)" />
            </mask>
          </defs>

          <!-- Scrolling wave group, clipped by fade mask -->
          <g mask="url(#waveFadeMask)">
            <g class="wave-scroll-group">
              <path
                d={wavePath}
                fill="none"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="stroke: {magColor(maxRegional)}; opacity: 0.7"
              />
            </g>
          </g>
        </svg>
      </div>

      <!-- Event list (toggleable) -->
      <div class="border-t border-border/60">
        <button
          type="button"
          onclick={() => (showList = !showList)}
          class="w-full flex items-center justify-between px-5 py-2.5 hover:bg-secondary/30 transition-colors"
        >
          <span class="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
            Ireland · UK · Europe (30d)
          </span>
          <span class="text-[10px] text-muted-foreground transition-transform duration-300 {showList ? 'rotate-180' : ''}">▾</span>
        </button>

        {#if showList}
          <div class="px-4 pb-3 space-y-0.5">
            {#each listEvents as e (e.id)}
              <div class="flex items-center gap-3 py-1.5 group">
                <!-- Magnitude badge -->
                <span class="shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-bold ring-1 {magBg(e.magnitude)}">
                  {e.magnitude}
                </span>
                <!-- Place -->
                <p class="flex-1 min-w-0 text-[11px] truncate text-foreground/80">
                  {e.place.replace(/^\d+\s+km\s+\w+\s+of\s+/i, '')}
                </p>
                <!-- Meta -->
                <div class="shrink-0 text-right">
                  <span class="text-[9px] font-mono text-muted-foreground">{timeAgo(e.time_ms)}</span>
                </div>
              </div>
            {/each}

            {#if globalEvents.length}
              <div class="pt-2 mt-1 border-t border-border/40">
                <p class="text-[9px] font-mono uppercase tracking-[0.28em] text-muted-foreground mb-1.5 px-1">Global significant</p>
                {#each globalEvents as e (e.id)}
                  <div class="flex items-center gap-3 py-1.5">
                    <span class="shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-bold ring-1 {magBg(e.magnitude)}">
                      {e.magnitude}
                    </span>
                    <p class="flex-1 min-w-0 text-[11px] truncate text-foreground/80">
                      {e.place.replace(/^\d+\s+km\s+\w+\s+of\s+/i, '')}
                    </p>
                    <span class="shrink-0 text-[9px] font-mono text-muted-foreground">{timeAgo(e.time_ms)}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="px-5 py-2.5 border-t border-border/40 seismic-footer-bg">
        <p class="text-[9px] font-mono uppercase tracking-[0.24em] text-muted-foreground/60">
          USGS Earthquakes · Ask the AI how this affects your survey window
        </p>
      </div>

    {:else}
      <!-- Skeleton loading -->
      <div class="px-5 py-4 flex gap-5 items-center animate-pulse">
        <div class="w-[72px] h-[72px] rounded-full bg-secondary/60 shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 w-24 rounded-full bg-secondary"></div>
          <div class="h-4 w-40 rounded-full bg-secondary"></div>
          <div class="h-2.5 w-28 rounded-full bg-secondary"></div>
        </div>
      </div>
    {/if}

  </div>
{/if}

<style>
  .seismic-card {
    background: color-mix(in oklab, var(--card) 90%, var(--background) 10%);
  }

  .seismic-wave-bg {
    background: color-mix(in oklab, var(--secondary) 40%, transparent);
  }

  .seismic-footer-bg {
    background: color-mix(in oklab, var(--secondary) 30%, transparent);
  }

  /* Expanding sonar rings */
  .seismic-ring {
    animation: seismic-expand linear infinite;
  }

  @keyframes seismic-expand {
    0%   { transform: scale(0.35); opacity: 0.9; }
    70%  { opacity: 0.3; }
    100% { transform: scale(2.2);  opacity: 0; }
  }

  /* Scrolling seismograph waveform */
  .wave-scroll-group {
    animation: seismic-wave-scroll 14s linear infinite;
  }

  @keyframes seismic-wave-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-400px); }
  }
</style>
