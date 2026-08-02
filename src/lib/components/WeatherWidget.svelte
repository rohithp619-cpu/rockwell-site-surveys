<script lang="ts">
  import { onMount } from 'svelte';
  import type { WeatherData, SurveyCondition } from '$lib/weather.server';
  import { wmoLabel, wmoEmoji, compassDir } from '$lib/weather';

  let {
    lat = undefined,
    lng = undefined,
  }: { lat?: number; lng?: number } = $props();

  let data = $state<WeatherData | null>(null);
  let error = $state(false);
  let collapsed = $state(false);

  onMount(async () => {
    try {
      const url =
        lat !== undefined && lng !== undefined
          ? `/api/weather?lat=${lat}&lng=${lng}`
          : '/api/weather';
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      data = await res.json();
    } catch {
      error = true;
    }
  });

  function suitClass(s: SurveyCondition): string {
    if (s === 'ok') return 'text-green-600 bg-green-500/10 ring-green-500/25';
    if (s === 'marginal') return 'text-yellow-700 bg-yellow-400/15 ring-yellow-500/25';
    return 'text-red-600 bg-red-500/10 ring-red-500/25';
  }

  function suitIcon(s: SurveyCondition): string {
    if (s === 'ok') return '✓';
    if (s === 'marginal') return '⚠';
    return '✗';
  }

  function suitLabel(s: SurveyCondition): string {
    if (s === 'ok') return 'Go';
    if (s === 'marginal') return 'Caution';
    return 'Hold';
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  const dayForecast = $derived(data?.forecast.slice(1, 4) ?? []);
</script>

{#if !error}
  <div class="rounded-2xl border border-border bg-card overflow-hidden fade-in text-sm">

    <!-- Header -->
    <button
      type="button"
      onclick={() => (collapsed = !collapsed)}
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
    >
      <div class="flex items-center gap-2.5">
        <span class="text-base leading-none" aria-hidden="true">
          {data ? wmoEmoji(data.current.weather_code) : '🌡️'}
        </span>
        <span class="text-[10px] font-mono uppercase tracking-[0.28em] text-foreground font-medium">
          Live · Weather · Dublin
        </span>
        {#if data}
          <span class="text-[10px] font-mono text-muted-foreground">
            {data.current.temperature_2m.toFixed(1)}°C ·
            {wmoLabel(data.current.weather_code)} ·
            Wind {data.current.wind_speed_10m.toFixed(1)} m/s
          </span>
        {:else if !data}
          <span class="text-[10px] font-mono text-muted-foreground">Loading…</span>
        {/if}
      </div>
      <span class="text-muted-foreground text-xs transition-transform duration-300 {collapsed ? '' : 'rotate-180'}">▾</span>
    </button>

    <!-- Body -->
    {#if !collapsed && data}
      {@const c = data.current}
      {@const s = data.suitability}

      <div class="border-t border-border">

        <!-- Current conditions grid -->
        <div class="px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-secondary/40 rounded-xl p-3">
            <p class="text-[9px] font-mono uppercase tracking-[0.26em] text-muted-foreground">Temperature</p>
            <p class="mt-1 text-xl font-semibold">{c.temperature_2m.toFixed(1)}°C</p>
            <p class="text-[10px] text-muted-foreground">feels {c.apparent_temperature.toFixed(1)}°C</p>
          </div>
          <div class="bg-secondary/40 rounded-xl p-3">
            <p class="text-[9px] font-mono uppercase tracking-[0.26em] text-muted-foreground">Wind</p>
            <p class="mt-1 text-xl font-semibold">{c.wind_speed_10m.toFixed(1)} m/s</p>
            <p class="text-[10px] text-muted-foreground">{compassDir(c.wind_direction_10m)} · gusts {c.wind_gusts_10m.toFixed(1)}</p>
          </div>
          <div class="bg-secondary/40 rounded-xl p-3">
            <p class="text-[9px] font-mono uppercase tracking-[0.26em] text-muted-foreground">Precipitation</p>
            <p class="mt-1 text-xl font-semibold">{c.precipitation} mm</p>
            <p class="text-[10px] text-muted-foreground">{wmoLabel(c.weather_code)}</p>
          </div>
          <div class="bg-secondary/40 rounded-xl p-3">
            <p class="text-[9px] font-mono uppercase tracking-[0.26em] text-muted-foreground">Visibility</p>
            <p class="mt-1 text-xl font-semibold">{(c.visibility / 1000).toFixed(1)} km</p>
            <p class="text-[10px] text-muted-foreground">Humidity {c.relative_humidity_2m}%</p>
          </div>
        </div>

        <!-- Survey suitability -->
        <div class="border-t border-border px-4 py-3">
          <p class="text-[9px] font-mono uppercase tracking-[0.28em] text-muted-foreground mb-2.5">Survey conditions now</p>
          <div class="space-y-2">
            {#each [
              { label: 'Drone surveys', suit: s.drone, reason: s.drone_reason },
              { label: 'Structural / inspection', suit: s.structural, reason: s.structural_reason },
              { label: 'Geotechnical / ground', suit: s.geotechnical, reason: s.geotechnical_reason },
            ] as row}
              <div class="flex items-start gap-2.5">
                <span class="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ring-1 {suitClass(row.suit)}">
                  {suitIcon(row.suit)} {suitLabel(row.suit)}
                </span>
                <div class="min-w-0">
                  <p class="text-[11px] font-medium text-foreground">{row.label}</p>
                  <p class="text-[10px] text-muted-foreground leading-snug">{row.reason}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- 3-day forecast strip -->
        {#if dayForecast.length}
          <div class="border-t border-border px-4 py-3">
            <p class="text-[9px] font-mono uppercase tracking-[0.28em] text-muted-foreground mb-2.5">Outlook</p>
            <div class="grid grid-cols-3 gap-2">
              {#each dayForecast as d}
                <div class="bg-secondary/30 rounded-xl px-3 py-2.5 text-center">
                  <p class="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{formatDate(d.date)}</p>
                  <p class="mt-1 text-lg">{wmoEmoji(d.weather_code)}</p>
                  <p class="text-[10px] font-medium">{d.temperature_min.toFixed(0)}–{d.temperature_max.toFixed(0)}°C</p>
                  <p class="text-[9px] font-mono text-muted-foreground mt-0.5">
                    {d.precipitation_sum.toFixed(1)} mm · {d.wind_gusts_max.toFixed(0)} m/s g
                  </p>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Footer -->
        <div class="border-t border-border px-4 py-2.5 bg-secondary/30">
          <p class="text-[10px] text-muted-foreground leading-snug">
            Open-Meteo · Dublin · updated {new Date(data.fetched_at).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })} UTC · Ask the AI how conditions affect your survey window.
          </p>
        </div>
      </div>
    {/if}

    <!-- Skeleton -->
    {#if !collapsed && !data && !error}
      <div class="border-t border-border px-4 py-4 space-y-3 animate-pulse">
        <div class="grid grid-cols-4 gap-3">
          {#each [1,2,3,4] as _}
            <div class="bg-secondary rounded-xl h-16"></div>
          {/each}
        </div>
        <div class="space-y-2">
          {#each [1,2,3] as _}
            <div class="flex gap-2 items-center">
              <div class="h-5 w-14 rounded-full bg-secondary"></div>
              <div class="h-3 flex-1 rounded bg-secondary"></div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </div>
{/if}
