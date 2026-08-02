<script lang="ts">
  import { onMount } from 'svelte';
  import Reveal from '$lib/components/Reveal.svelte';
  import type { WeatherData } from '$lib/weather.server';
  import { wmoLabel } from '$lib/weather';

  const DRONE_VIDEO =
    'https://videos.pexels.com/video-files/4237250/4237250-hd_1920_1080_30fps.mp4';

  const nodes: [number, number][] = [
    [220, 150],
    [700, 120],
    [780, 400],
    [300, 470],
  ];

  const labels = [
    { x: 455, y: 118, t: '128.40 m' },
    { x: 805, y: 265, t: '74.15 m' },
    { x: 520, y: 495, t: '131.02 m' },
    { x: 200, y: 320, t: '71.68 m' },
  ];

  let weather = $state<WeatherData | null>(null);

  onMount(async () => {
    const res = await fetch('/api/weather').catch(() => null);
    if (res?.ok) weather = await res.json();
  });

  function compassDir(deg: number): string {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  const liveWeather = $derived(
    weather
      ? `${weather.current.temperature_2m.toFixed(0)}°C · ${compassDir(weather.current.wind_direction_10m)} ${weather.current.wind_speed_10m.toFixed(1)} m/s · ${wmoLabel(weather.current.weather_code)}`
      : '9°C · SW 12kt · clear'
  );

  const droneSuit = $derived(weather?.suitability.drone ?? null);
  const suitBadge = $derived(
    droneSuit === 'ok' ? '✓ Drone: flyable' :
    droneSuit === 'marginal' ? '⚠ Drone: marginal' :
    droneSuit === 'unsuitable' ? '✗ Drone: hold' :
    'Capturing'
  );
  const suitColor = $derived(
    droneSuit === 'ok' ? 'bg-green-500' :
    droneSuit === 'marginal' ? 'bg-yellow-500' :
    droneSuit === 'unsuitable' ? 'bg-red-500' :
    'bg-accent'
  );
</script>

<section class="mx-auto max-w-[1280px] px-6 py-10 md:py-16">
  <Reveal class="relative overflow-hidden rounded-[28px] border border-border bg-card">

    <!-- Aerial drone footage -->
    <video
      src={DRONE_VIDEO}
      autoplay
      loop
      muted
      playsinline
      class="h-[420px] md:h-[600px] w-full object-cover"
      aria-hidden="true"
    ></video>

    <!-- Survey measurement overlay -->
    <svg
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      class="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="scanGrad" x1="0" x2="1">
          <stop offset="0%"   stop-color="var(--accent)" stop-opacity="0" />
          <stop offset="50%"  stop-color="var(--accent)" stop-opacity="0.45" />
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Scan sweep -->
      <rect
        class="survey-scan"
        x="-260" y="0" width="260" height="600"
        fill="url(#scanGrad)"
      />

      <!-- Parcel boundary polygon -->
      <polygon
        class="survey-path"
        points="220,150 700,120 780,400 300,470"
        fill="color-mix(in oklab, var(--accent) 10%, transparent)"
        stroke="var(--accent)"
        stroke-width="2.5"
        stroke-dasharray="2400"
      />

      <!-- Diagonal tie line -->
      <line
        class="survey-path survey-delay-1"
        x1="220" y1="150" x2="780" y2="400"
        stroke="color-mix(in oklab, var(--accent) 60%, transparent)"
        stroke-width="1.5"
        stroke-dasharray="8 8"
      />

      <!-- Corner nodes -->
      {#each nodes as [x, y], i}
        <g class="survey-node" style="animation-delay: {1.4 + i * 0.18}s">
          <circle
            cx={x} cy={y} r="16"
            fill="none"
            stroke="color-mix(in oklab, var(--accent) 40%, transparent)"
            stroke-width="1.5"
          />
          <circle cx={x} cy={y} r="5" fill="var(--accent)" />
        </g>
      {/each}

      <!-- Dimension labels -->
      {#each labels as d, i}
        <g class="survey-label" style="animation-delay: {2 + i * 0.2}s">
          <rect
            x={d.x - 46} y={d.y - 15} rx="6"
            width="92" height="26"
            fill="color-mix(in oklab, var(--background) 85%, transparent)"
            stroke="color-mix(in oklab, var(--accent) 50%, transparent)"
          />
          <text
            x={d.x} y={d.y + 4}
            text-anchor="middle"
            font-size="14"
            font-family="var(--font-mono, monospace)"
            fill="var(--foreground)"
          >{d.t}</text>
        </g>
      {/each}
    </svg>

    <!-- Top-left HUD -->
    <div class="pointer-events-none absolute left-6 top-6 rounded-xl bg-background/80 px-4 py-3 backdrop-blur-md border border-border">
      <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        RTK GNSS · Drone topo
      </p>
      <p class="mt-1 text-sm font-semibold">Parcel area 0.92 ha · ±18 mm</p>
    </div>

    <!-- Bottom-right survey suitability badge (live) -->
    <div class="pointer-events-none absolute right-6 bottom-[6.5rem] md:bottom-[5.5rem] flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 backdrop-blur-md border border-border transition-all duration-700">
      <span class="h-2 w-2 rounded-full {suitColor} animate-pulse"></span>
      <span class="font-mono text-[11px] uppercase tracking-[0.18em]">{suitBadge}</span>
    </div>

    <!-- Bottom telemetry bar with live weather -->
    <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-5 text-primary-foreground bg-gradient-to-t from-black/70 to-transparent">
      <div>
        <p class="text-[10px] uppercase tracking-[0.18em] opacity-60">Location</p>
        <p class="mt-1 text-xs md:text-sm font-medium">53.3498° N · 6.2603° W</p>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-[0.18em] opacity-60">Job</p>
        <p class="mt-1 text-xs md:text-sm font-medium">RS009 · Topographic</p>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-[0.18em] opacity-60">Crew</p>
        <p class="mt-1 text-xs md:text-sm font-medium">M. Ryan · C. Ó Briain</p>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-[0.18em] opacity-60">
          Weather · Live
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-accent ml-1 animate-pulse"></span>
        </p>
        <p class="mt-1 text-xs md:text-sm font-medium transition-all duration-700">{liveWeather}</p>
      </div>
    </div>

  </Reveal>
</section>
