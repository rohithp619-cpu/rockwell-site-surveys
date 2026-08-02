<script lang="ts">
  import { onMount } from 'svelte';
  import { coordsForRegion, wmoLabel, wmoEmoji, compassDir } from '$lib/weather';
  import type { WeatherData, SurveyCondition } from '$lib/weather.server';
  import type { SeismicData } from '$lib/seismic.server';

  let {
    surveyId = null,
    surveyName = '',
    region = 'Dublin',
  }: { surveyId?: string | null; surveyName?: string; region?: string } = $props();

  let weather = $state<WeatherData | null>(null);
  let seismic = $state<SeismicData | null>(null);

  // Re-fetch weather whenever region changes (reactive to prop)
  $effect(() => {
    const r = region; // track reactive dep
    const [lat, lng] = coordsForRegion(r);
    let cancelled = false;
    weather = null;
    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then((res) => (res?.ok ? res.json() : null))
      .then((d) => { if (!cancelled && d) weather = d; })
      .catch(() => {});
    return () => { cancelled = true; };
  });

  // Seismic is not location-specific — fetch once on mount
  onMount(async () => {
    const res = await fetch('/api/seismic').catch(() => null);
    if (res?.ok) seismic = await res.json();
  });

  function suitColor(s: SurveyCondition): string {
    if (s === 'ok') return 'text-green-500';
    if (s === 'marginal') return 'text-yellow-500';
    return 'text-red-500';
  }
  function suitIcon(s: SurveyCondition): string {
    return s === 'ok' ? '✓' : s === 'marginal' ? '⚠' : '✗';
  }

  const topSeismic = $derived(
    seismic
      ? ([...seismic.regional, ...seismic.global_significant].sort(
          (a, b) => b.magnitude - a.magnitude
        )[0] ?? null)
      : null
  );

  function magColor(m: number): string {
    if (m >= 6) return '#ef4444';
    if (m >= 4.5) return '#f97316';
    if (m >= 3) return '#eab308';
    return 'var(--accent)';
  }

  function timeAgo(ms: number): string {
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  }

  function shortPlace(place: string): string {
    const clean = place.replace(/^\d+\s+km\s+\w+\s+of\s+/i, '');
    return clean.length > 24 ? clean.slice(0, 22) + '…' : clean;
  }

  const ringDuration = $derived(
    topSeismic
      ? topSeismic.magnitude >= 5 ? 1.6 : topSeismic.magnitude >= 3 ? 2.2 : 3.0
      : 3.0
  );

  // Wind streak speed: fast gusts = short duration (min 0.5s, max 3.5s)
  const windStreakDuration = $derived(
    weather
      ? Math.max(0.5, (3.5 - weather.current.wind_gusts_10m * 0.07)).toFixed(2) + 's'
      : '2s'
  );

  type WeatherScene = 'clear' | 'partly-cloudy' | 'overcast' | 'fog' | 'rain' | 'snow' | 'storm';

  function weatherScene(code: number): WeatherScene {
    if (code === 0) return 'clear';
    if (code <= 2) return 'partly-cloudy';
    if (code === 3) return 'overcast';
    if (code <= 48) return 'fog';
    if (code <= 77) return code >= 71 ? 'snow' : 'rain';
    if (code <= 82) return 'rain';
    return 'storm';
  }

  function weatherGradient(code: number): string {
    const s = weatherScene(code);
    if (s === 'clear')        return 'linear-gradient(160deg,#1565C0 0%,#1E88E5 55%,#64B5F6 100%)';
    if (s === 'partly-cloudy') return 'linear-gradient(160deg,#1976D2 0%,#4FC3F7 55%,#81D4FA 100%)';
    if (s === 'overcast')     return 'linear-gradient(160deg,#455A64 0%,#607D8B 50%,#90A4AE 100%)';
    if (s === 'fog')          return 'linear-gradient(160deg,#546E7A 0%,#90A4AE 55%,#CFD8DC 100%)';
    if (s === 'rain')         return 'linear-gradient(160deg,#263238 0%,#37474F 50%,#546E7A 100%)';
    if (s === 'snow')         return 'linear-gradient(160deg,#4A6572 0%,#8DA9B5 55%,#CFD8DC 100%)';
    /* storm */               return 'linear-gradient(160deg,#1A1A2E 0%,#2D3561 50%,#3E4C8A 100%)';
  }

  const wScene = $derived(weather ? weatherScene(weather.current.weather_code) : 'overcast' as WeatherScene);
  const wGradient = $derived(weather ? weatherGradient(weather.current.weather_code) : 'linear-gradient(160deg,#455A64,#607D8B,#90A4AE)');
  const isWindy = $derived(weather ? weather.current.wind_speed_10m > 4 : false);

  // Seismic glow pulse: tied to ring duration
  const seismicGlowDuration = $derived((ringDuration * 1.2).toFixed(1) + 's');

  // Magnitude glow colour (semi-transparent)
  const magGlow = $derived(
    topSeismic
      ? topSeismic.magnitude >= 6   ? 'rgba(239,68,68,0.18)'
      : topSeismic.magnitude >= 4.5 ? 'rgba(249,115,22,0.15)'
      : topSeismic.magnitude >= 3   ? 'rgba(234,179,8,0.13)'
      : 'rgba(var(--accent-rgb,120,100,60),0.12)'
      : 'rgba(0,0,0,0)'
  );
</script>

<div class="shrink-0 border-b border-border bg-background/95 backdrop-blur-md">
  <div class="w-full px-4 py-2">

    <!-- Survey header (only when in survey context) -->
    {#if surveyId}
      <div class="flex items-center gap-2 mb-2">
        <span class="relative flex h-1.5 w-1.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60"></span>
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
        </span>
        <span class="text-[10px] font-mono uppercase tracking-[0.28em] text-accent">
          {surveyId}{surveyName ? ` · ${surveyName}` : ''} · {region}
        </span>
        <a
          href="/services/{surveyId}"
          class="ml-auto text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
        >← survey</a>
      </div>
    {/if}

    <!-- Three-card grid: Weather · Survey Conditions · Seismic -->
    <div class="grid grid-cols-3 gap-2">

      <!-- ── Weather widget (Apple Weather style) ── -->
      <div class="relative rounded-2xl overflow-hidden" style="background:{wGradient}; border:1px solid rgba(255,255,255,0.12)">

        <!-- ── Animated scene layer ── -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">

          {#if wScene === 'clear'}
            <!-- Sun: radial glow that breathes -->
            <div class="sun-orb absolute" style="top:-30%;right:-10%;width:120px;height:120px"></div>
            <div class="sun-ray absolute" style="top:-20%;right:-5%;width:100px;height:100px"></div>

          {:else if wScene === 'partly-cloudy'}
            <!-- Bright cloud + sun peek -->
            <div class="sun-orb absolute" style="top:-20%;right:5%;width:80px;height:80px;opacity:0.6"></div>
            <div class="apple-cloud absolute" style="top:18%;right:-5%;width:100px;height:28px;animation-duration:14s"></div>
            <div class="apple-cloud absolute" style="top:48%;left:-10%;width:75px;height:22px;opacity:0.55;animation-duration:20s;animation-direction:reverse"></div>

          {:else if wScene === 'overcast'}
            <!-- Three layered clouds drifting at different depths/speeds -->
            <div class="apple-cloud absolute" style="top:5%;left:-15%;width:130px;height:34px;opacity:0.35;animation-duration:18s"></div>
            <div class="apple-cloud absolute" style="top:32%;right:-20%;width:110px;height:28px;opacity:0.25;animation-duration:26s;animation-direction:reverse"></div>
            <div class="apple-cloud absolute" style="top:62%;left:-5%;width:90px;height:22px;opacity:0.18;animation-duration:34s"></div>

          {:else if wScene === 'fog'}
            <!-- Horizontal fog bands -->
            <div class="fog-band absolute" style="top:15%;animation-duration:12s"></div>
            <div class="fog-band absolute" style="top:45%;animation-duration:18s;animation-direction:reverse;opacity:0.5"></div>
            <div class="fog-band absolute" style="top:72%;animation-duration:22s;opacity:0.35"></div>

          {:else if wScene === 'rain' || wScene === 'storm'}
            <!-- Rain drops + cloud mass -->
            <div class="apple-cloud absolute" style="top:-8%;left:-10%;width:140px;height:38px;opacity:0.3;animation-duration:22s"></div>
            {#each Array(14) as _, i}
              <div
                class="rain-drop absolute"
                style="
                  left:{(i * 7 + (i % 3) * 2)}%;
                  animation-duration:{(0.55 + (i % 4) * 0.12).toFixed(2)}s;
                  animation-delay:{(i * 0.11).toFixed(2)}s;
                  height:{6 + (i % 3) * 3}px;
                  opacity:{0.25 + (i % 3) * 0.08};
                "
              ></div>
            {/each}
            {#if wScene === 'storm'}
              <div class="lightning-flash absolute inset-0"></div>
            {/if}

          {:else if wScene === 'snow'}
            <!-- Snowflakes -->
            {#each Array(10) as _, i}
              <div
                class="snowflake absolute"
                style="
                  left:{(i * 10 + (i % 3) * 3)}%;
                  animation-duration:{(2.5 + (i % 4) * 0.7).toFixed(1)}s;
                  animation-delay:{(i * 0.35).toFixed(2)}s;
                  font-size:{8 + (i % 3) * 3}px;
                "
              >❄</div>
            {/each}
          {/if}

          <!-- Wind streaks overlay (when windy, all scenes) -->
          {#if isWindy}
            {#each [0, 1, 2] as i}
              <div
                class="wind-streak absolute"
                style="
                  animation-duration:{windStreakDuration};
                  animation-delay:{(i * parseFloat(windStreakDuration) / 3).toFixed(2)}s;
                  top:{22 + i * 26}%;
                "
              ></div>
            {/each}
          {/if}
        </div>

        <!-- ── Content (white text on gradient) ── -->
        <div class="relative px-3 pt-2 pb-0">

          <!-- Header -->
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-1.5">
              <span class="relative flex h-1.5 w-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-70"></span>
                <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/90"></span>
              </span>
              <span class="text-[9px] font-mono uppercase tracking-[0.28em] text-white/70">Weather</span>
            </div>
            {#if weather}
              <span class="text-[9px] font-mono text-white/50">{region}</span>
            {/if}
          </div>

          {#if weather}
            {@const c = weather.current}

            <!-- Hero: temperature + wind -->
            <div class="flex items-end justify-between gap-2">
              <div class="flex items-baseline gap-1">
                <span class="text-[30px] font-bold leading-none tracking-tight text-white drop-shadow-sm">
                  {c.temperature_2m.toFixed(0)}°
                </span>
              </div>
              <div class="text-right pb-0.5">
                <p class="text-[10px] font-mono text-white/75 leading-snug">
                  {compassDir(c.wind_direction_10m)} {c.wind_speed_10m.toFixed(1)} m/s
                </p>
                {#if c.wind_gusts_10m > c.wind_speed_10m + 3}
                  <p class="text-[9px] font-mono text-white/50">gusts {c.wind_gusts_10m.toFixed(0)}</p>
                {/if}
              </div>
            </div>

            <!-- Condition -->
            <p class="mt-0.5 text-[11px] text-white/80">{wmoLabel(c.weather_code)}</p>

            <!-- Suitability strip -->
            <div class="mt-1.5 flex items-center gap-3">
              {#each [
                { label: 'Drone',  suit: weather.suitability.drone },
                { label: 'Struct', suit: weather.suitability.structural },
                { label: 'Geo',    suit: weather.suitability.geotechnical },
              ] as row}
                <span class="text-[9px] font-mono font-semibold {
                  row.suit === 'ok'       ? 'text-emerald-300' :
                  row.suit === 'marginal' ? 'text-yellow-300' : 'text-red-300'
                }">
                  {suitIcon(row.suit)} {row.label}
                </span>
              {/each}
            </div>

          {:else}
            <!-- Skeleton on gradient -->
            <div class="animate-pulse space-y-2">
              <div class="h-8 w-20 rounded-lg bg-white/15"></div>
              <div class="h-2.5 w-28 rounded-full bg-white/10"></div>
              <div class="flex gap-3">
                {#each [1,2,3] as _}<div class="h-2 w-10 rounded-full bg-white/10"></div>{/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Footer -->
        <div class="mt-2 border-t border-white/10 px-3 py-1 bg-black/10">
          <p class="text-[8.5px] font-mono uppercase tracking-[0.24em] text-white/40">
            Open-Meteo · live
          </p>
        </div>
      </div>

      <!-- ── Survey Conditions Now (2nd card, same size as Weather) ── -->
      <div class="rounded-2xl border border-border overflow-hidden widget-card">
        <div class="px-3 pt-2 pb-0">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60"></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
            </span>
            <span class="text-[9px] font-mono uppercase tracking-[0.28em] text-muted-foreground">Survey conditions now</span>
          </div>

          {#if weather}
            <div class="space-y-2 pb-1">
              {#each [
                { label: 'Drone surveys',           suit: weather.suitability.drone,        reason: weather.suitability.drone_reason },
                { label: 'Structural / inspection', suit: weather.suitability.structural,   reason: weather.suitability.structural_reason },
                { label: 'Geotechnical / ground',   suit: weather.suitability.geotechnical, reason: weather.suitability.geotechnical_reason },
              ] as row}
                <div class="flex items-start gap-2">
                  <span class="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold ring-1 {
                    row.suit === 'ok'       ? 'text-green-600 bg-green-500/10 ring-green-500/25 pill-go' :
                    row.suit === 'marginal' ? 'text-yellow-700 bg-yellow-400/15 ring-yellow-500/25 pill-caution' :
                                             'text-red-600 bg-red-500/10 ring-red-500/25 pill-hold'
                  }">
                    {suitIcon(row.suit)}
                    {row.suit === 'ok' ? 'Go' : row.suit === 'marginal' ? 'Caution' : 'Hold'}
                  </span>
                  <div class="min-w-0">
                    <p class="text-[10px] font-medium text-foreground leading-tight">{row.label}</p>
                    <p class="mt-0.5 text-[9px] text-muted-foreground leading-snug">{row.reason}</p>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="animate-pulse space-y-2 pb-1">
              {#each [1,2,3] as _}
                <div class="flex gap-2 items-center">
                  <div class="h-4 w-12 rounded-full bg-secondary shrink-0"></div>
                  <div class="h-2.5 flex-1 rounded-full bg-secondary"></div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Footer -->
        <div class="mt-2 border-t border-border/50 px-3 py-1 bg-secondary/30">
          <p class="text-[8.5px] font-mono uppercase tracking-[0.24em] text-muted-foreground/60">
            Open-Meteo · live
          </p>
        </div>
      </div>

      <!-- ── Seismic widget (3rd card) ── -->
      <div class="relative rounded-2xl border border-border overflow-hidden widget-card">

        <!-- Magnitude radial glow — pulses behind sonar rings -->
        <div
          class="absolute inset-0 pointer-events-none seismic-glow"
          style="
            background: radial-gradient(ellipse 60% 70% at 82% 50%, {magGlow}, transparent 70%);
            animation-duration: {seismicGlowDuration};
          "
        ></div>

        <!-- Severity tint -->
        {#if topSeismic}
          <div class="absolute inset-0 pointer-events-none opacity-[0.04] {
            topSeismic.magnitude >= 5 ? 'bg-red-500' :
            topSeismic.magnitude >= 3.5 ? 'bg-orange-500' : 'bg-accent'
          }"></div>
        {/if}

        <div class="relative px-3 pt-2 pb-0">
          <!-- Widget header -->
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-1.5">
              <span class="relative flex h-1.5 w-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60"></span>
                <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
              </span>
              <span class="text-[9px] font-mono uppercase tracking-[0.28em] text-muted-foreground">Seismic</span>
            </div>
            <span class="text-[9px] font-mono text-muted-foreground/60">USGS · Europe</span>
          </div>

          <!-- Sonar + event summary -->
          <div class="flex items-center gap-3">
            <div class="relative flex items-center justify-center shrink-0" style="width:44px;height:44px">
              {#each [0,1,2] as i}
                <div
                  class="absolute inset-0 rounded-full border ring-anim"
                  style="
                    border-color: {topSeismic ? magColor(topSeismic.magnitude) : 'var(--accent)'};
                    animation-duration: {ringDuration}s;
                    animation-delay: {i * (ringDuration / 3)}s;
                  "
                ></div>
              {/each}
              <div class="relative z-10 leading-none text-center">
                {#if seismic && topSeismic}
                  <span class="text-[8px] font-mono" style="color:{magColor(topSeismic.magnitude)}">M</span>
                  <span class="block text-[20px] font-bold leading-none" style="color:{magColor(topSeismic.magnitude)}">
                    {topSeismic.magnitude}
                  </span>
                {:else if seismic}
                  <span class="text-xl font-bold text-muted-foreground/30">—</span>
                {:else}
                  <div class="h-6 w-8 rounded bg-secondary animate-pulse"></div>
                {/if}
              </div>
            </div>
            <div class="min-w-0 flex-1">
              {#if seismic && topSeismic}
                <p class="text-[11px] font-medium leading-snug truncate">{shortPlace(topSeismic.place)}</p>
                <p class="mt-0.5 text-[10px] font-mono text-muted-foreground">
                  {topSeismic.depth_km} km · {timeAgo(topSeismic.time_ms)}
                </p>
                <p class="mt-0.5 text-[9px] font-mono text-muted-foreground/70">
                  {seismic.regional.length} regional · M1.5+
                </p>
              {:else if seismic}
                <p class="text-[11px] text-muted-foreground">No M1.5+ activity</p>
                <p class="mt-0.5 text-[9px] font-mono text-muted-foreground/60">Baseline clear</p>
              {:else}
                <div class="animate-pulse space-y-1.5">
                  <div class="h-3 w-24 rounded-full bg-secondary"></div>
                  <div class="h-2 w-16 rounded-full bg-secondary"></div>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-2 border-t border-border/50 px-3 py-1 bg-secondary/30">
          <p class="text-[8.5px] font-mono uppercase tracking-[0.24em] text-muted-foreground/60">
            USGS earthquakes · live
          </p>
        </div>
      </div>

    </div>

  </div>
</div>

<style>
  .widget-card {
    background: color-mix(in oklab, var(--secondary) 45%, var(--background) 55%);
  }

  .ring-anim {
    animation: bar-ring-expand linear infinite;
    transform-origin: center;
  }

  @keyframes bar-ring-expand {
    0%   { transform: scale(0.3); opacity: 0.85; }
    70%  { opacity: 0.3; }
    100% { transform: scale(2.4); opacity: 0; }
  }

  /* ── Apple Weather scene layers ── */

  /* Sun orb: pulsing radial glow */
  .sun-orb {
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,220,80,0.55) 0%, rgba(255,180,30,0.25) 50%, transparent 70%);
    animation: sun-breathe 4s ease-in-out infinite;
  }
  .sun-ray {
    border-radius: 50%;
    background: radial-gradient(circle, transparent 30%, rgba(255,220,80,0.12) 60%, transparent 75%);
    animation: sun-breathe 4s ease-in-out infinite reverse;
  }
  @keyframes sun-breathe {
    0%, 100% { transform: scale(1); opacity: 0.85; }
    50%       { transform: scale(1.18); opacity: 1; }
  }

  /* Cloud: pill shape drifting horizontally */
  .apple-cloud {
    border-radius: 9999px;
    background: rgba(255,255,255,0.18);
    animation: cloud-drift linear infinite;
  }
  @keyframes cloud-drift {
    0%   { transform: translateX(-20%); }
    100% { transform: translateX(140%); }
  }

  /* Fog bands: wide translucent strips sweeping across */
  .fog-band {
    left: -60%;
    width: 220%;
    height: 14px;
    border-radius: 9999px;
    background: rgba(255,255,255,0.12);
    animation: fog-sweep linear infinite;
  }
  @keyframes fog-sweep {
    0%   { transform: translateX(0); opacity: 0.6; }
    50%  { opacity: 1; }
    100% { transform: translateX(30%); opacity: 0.6; }
  }

  /* Rain drops: thin vertical streaks falling */
  .rain-drop {
    top: -8px;
    width: 1.5px;
    border-radius: 9999px;
    background: linear-gradient(to bottom, transparent, rgba(180,210,255,0.7));
    animation: rain-fall linear infinite;
  }
  @keyframes rain-fall {
    0%   { transform: translateY(-10px); opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: 0.8; }
    100% { transform: translateY(140px); opacity: 0; }
  }

  /* Snowflakes: drifting and falling */
  .snowflake {
    top: -16px;
    color: rgba(255,255,255,0.75);
    animation: snow-fall linear infinite;
    user-select: none;
  }
  @keyframes snow-fall {
    0%   { transform: translateY(-10px) translateX(0); opacity: 0; }
    10%  { opacity: 1; }
    50%  { transform: translateY(60px) translateX(8px); }
    90%  { opacity: 0.6; }
    100% { transform: translateY(130px) translateX(-4px); opacity: 0; }
  }

  /* Lightning flash: full-card white flicker on storm */
  .lightning-flash {
    background: rgba(255,255,255,0.06);
    animation: lightning 6s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes lightning {
    0%, 88%, 92%, 96%, 100% { opacity: 0; }
    89%, 93%                 { opacity: 0.5; }
    91%, 95%                 { opacity: 0; }
  }

  /* ── Wind streaks (Weather card) ── */
  .wind-streak {
    left: -40%;
    width: 35%;
    height: 1.5px;
    border-radius: 9999px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 40%, transparent);
    animation: wind-sweep linear infinite;
  }

  @keyframes wind-sweep {
    0%   { transform: translateX(0) skewX(-12deg); opacity: 0; }
    10%  { opacity: 1; }
    85%  { opacity: 1; }
    100% { transform: translateX(380%) skewX(-12deg); opacity: 0; }
  }

  /* ── Suitability pill pulses (Survey Conditions card) ── */
  .pill-hold {
    animation: pulse-hold 1.6s ease-in-out infinite;
  }
  .pill-caution {
    animation: pulse-caution 2.4s ease-in-out infinite;
  }
  .pill-go {
    animation: pulse-go 3.5s ease-in-out infinite;
  }

  @keyframes pulse-hold {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    40%       { box-shadow: 0 0 0 4px rgba(239,68,68,0.25); }
    70%       { box-shadow: 0 0 0 7px rgba(239,68,68,0); }
  }
  @keyframes pulse-caution {
    0%, 100% { box-shadow: 0 0 0 0 rgba(234,179,8,0); }
    40%       { box-shadow: 0 0 0 4px rgba(234,179,8,0.22); }
    70%       { box-shadow: 0 0 0 7px rgba(234,179,8,0); }
  }
  @keyframes pulse-go {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    50%       { box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
  }

  /* ── Seismic radial glow (behind sonar rings) ── */
  .seismic-glow {
    animation: seismic-glow-pulse ease-in-out infinite;
  }

  @keyframes seismic-glow-pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.08); }
  }
</style>
