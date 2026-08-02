<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { newThreadId } from '$lib/chat-storage';
  import { HardHat, Building2, Compass, Radio, Waves, Map, Search, X } from 'lucide-svelte';

  import type { SeismicData, SeismicEvent } from '$lib/seismic.server';
  import type { Service } from '$lib/services';
  import { imageFor, formatEur } from '$lib/services';

  import type { PageData } from './$types';

  type SeismicType = 'structural' | 'geotechnical' | 'topographic' | 'flood' | 'vibration';

  type Suggestion = {
    icon: typeof HardHat;
    label: string;
    hint: string;
    prompt: string;
    seismicType: SeismicType;
    seismicContext: string;
  };

  const suggestions: Suggestion[] = [
    {
      icon: HardHat,
      label: 'Pre-purchase check',
      hint: 'Residential · Dublin',
      prompt: "I'm buying a 1930s semi-detached in Dublin. Which Rockwell survey should I book and what will the engineer look for?",
      seismicType: 'structural',
      seismicContext: 'Seismic history affects settlement & crack risk',
    },
    {
      icon: Building2,
      label: 'Cracks in a gable wall',
      hint: 'Structural monitoring',
      prompt: "There are diagonal cracks appearing on the gable wall of my house. How do I know if it's subsidence, and what monitoring do you recommend?",
      seismicType: 'structural',
      seismicContext: 'Ground tremors accelerate crack propagation',
    },
    {
      icon: Compass,
      label: 'Drone topo for a site',
      hint: '1.2 ha in Meath',
      prompt: 'I need a topographic survey of a 1.2 hectare greenfield site in Meath for a planning application. Can Rockwell fly it, and what deliverables do I get?',
      seismicType: 'topographic',
      seismicContext: 'Terrain displacement context for mapping',
    },
    {
      icon: Radio,
      label: 'GPR before excavation',
      hint: 'Buried utilities',
      prompt: "We're about to excavate for a new foundation in a Dublin city site. What does a GPR utility scan involve and how far ahead should I book?",
      seismicType: 'geotechnical',
      seismicContext: 'Ground movement risk informs dig safety',
    },
    {
      icon: Waves,
      label: 'Flood risk assessment',
      hint: 'Cork Harbour',
      prompt: 'My planner asked for a site-specific flood risk assessment near Cork Harbour. What does Rockwell provide, what standards does it follow, and what is the typical turnaround?',
      seismicType: 'flood',
      seismicContext: 'Seismic events can disrupt drainage & embankments',
    },
    {
      icon: Map,
      label: 'Bridge principal inspection',
      hint: 'Rural road bridge',
      prompt: 'We manage a small rural road bridge in Donegal. Can Rockwell carry out a principal inspection and what capacity assessment do we get back?',
      seismicType: 'vibration',
      seismicContext: 'Vibration baseline required post-seismic event',
    },
  ];

  const categoryAccent: Record<string, string> = {
    'Structural Surveys':     'bg-blue-500',
    'Structural Inspections': 'bg-indigo-500',
    'Geotechnical':           'bg-amber-500',
    'Drone Surveys':          'bg-green-500',
    'Vibration Monitoring':   'bg-violet-500',
    'Geophysical Surveys':    'bg-cyan-500',
    'Measured Surveys':       'bg-orange-500',
    'Environmental':          'bg-emerald-500',
  };

  let { data }: { data: PageData } = $props();

  // Survey from URL params (e.g. coming from "Ask AI" button on service page)
  const urlSurvey = $derived(
    data.surveyId
      ? (data.services.find((s) => s.id === data.surveyId) ??
         (data.surveyName
           ? { id: data.surveyId, name: data.surveyName, region: data.region ?? 'Ireland' } as Service
           : null))
      : null
  );

  // Survey selected interactively from Explore mode
  let selectedSurvey = $state<Service | null>(null);

  // Active focus — selected overrides URL
  const focusSurvey = $derived(selectedSurvey ?? urlSurvey);

  // Mode tabs
  let mode = $state<'briefs' | 'explore'>('briefs');

  // Explore search + filter
  let query = $state('');
  let activeCat = $state<string | null>(null);

  const categories = $derived([...new Set(data.services.map((s) => s.category))].sort());

  const filteredServices = $derived(
    data.services.filter((s) => {
      const q = query.toLowerCase();
      const matchesSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q);
      const matchesCat = !activeCat || s.category === activeCat;
      return matchesSearch && matchesCat;
    })
  );

  let seismic = $state<SeismicData | null>(null);
  let draft = $state('');

  onMount(async () => {
    const res = await fetch('/api/seismic').catch(() => null);
    if (res?.ok) seismic = await res.json();

    if (urlSurvey && !draft) {
      draft = surveyQuestion(urlSurvey);
    }
  });

  function surveyQuestion(s: { id: string; name: string; region: string }): string {
    return `I'm looking at your ${s.name} (${s.id}) in ${s.region}. Can you walk me through what this survey covers, how today's weather and seismic conditions in ${s.region} affect the fieldwork window, and what I'll receive in the signed report?`;
  }

  function selectSurvey(s: Service) {
    selectedSurvey = s;
    draft = surveyQuestion(s);
    // Don't auto-switch mode — keep user in explore so they see the selected card
  }

  function clearSurvey() {
    selectedSurvey = null;
    if (!urlSurvey) draft = '';
  }

  const topRegional = $derived(
    seismic?.regional.length
      ? [...seismic.regional].sort((a, b) => b.magnitude - a.magnitude)[0]
      : null
  );
  const topGlobal = $derived(seismic?.global_significant[0] ?? null);

  function pickEvent(type: SeismicType): SeismicEvent | null {
    if (!seismic) return null;
    if (type === 'vibration' || type === 'flood') {
      if (topGlobal && (!topRegional || topGlobal.magnitude > topRegional.magnitude + 0.5))
        return topGlobal;
    }
    return topRegional;
  }

  function timeAgo(ms: number): string {
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'now';
  }

  function shortPlace(place: string): string {
    const match = place.match(/(?:of\s+)?(.+)$/i);
    const name = match?.[1] ?? place;
    return name.length > 28 ? name.slice(0, 26) + '…' : name;
  }

  function magClass(m: number): string {
    if (m >= 6) return 'text-red-500';
    if (m >= 4.5) return 'text-orange-500';
    if (m >= 3) return 'text-yellow-600';
    return 'text-accent';
  }

  function start(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    const id = newThreadId();
    const params = new URLSearchParams({ q: text });
    if (focusSurvey) {
      params.set('survey', focusSurvey.id);
      if (focusSurvey.name) params.set('surveyName', focusSurvey.name);
      if (focusSurvey.region) params.set('region', focusSurvey.region);
    }
    goto(`/chat/${id}?${params}`);
  }
</script>

<div class="flex-1 flex flex-col overflow-y-auto">

  <!-- ── Hero ──────────────────────────────────────────────────── -->
  <section class="mx-auto w-full max-w-4xl px-6 pt-12 pb-6">
    <p class="text-xs font-mono uppercase tracking-[0.3em] text-accent">Rockwell · Survey desk</p>

    {#if focusSurvey}
      <!-- Survey context pill -->
      <div class="mt-4 flex items-center gap-2 fade-in">
        <div class="inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
            {focusSurvey.id} · {focusSurvey.region}
          </span>
        </div>
        <button
          onclick={clearSurvey}
          class="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <X class="h-3 w-3" /> clear
        </button>
      </div>

      <h1 class="mt-5 text-5xl md:text-6xl leading-[0.95] rise">
        Ask about<br />
        <em class="not-italic text-muted-foreground">{focusSurvey.name}.</em>
      </h1>
      <p class="mt-5 max-w-xl text-muted-foreground text-sm fade-in [animation-delay:100ms]">
        Brief pre-loaded with live conditions for <span class="text-foreground">{focusSurvey.region}</span>.
        Edit or send as-is.
      </p>

    {:else}
      <h1 class="mt-6 text-6xl md:text-7xl leading-[0.95] rise">
        On-call<br />
        <em class="not-italic text-muted-foreground">chartered</em> engineer.
      </h1>
      <p class="mt-6 max-w-xl text-muted-foreground fade-in [animation-delay:150ms]">
        Describe your site, defect, or planning brief — or pick a survey below to
        narrow the context before you start.
      </p>
    {/if}

    <!-- Input -->
    <form
      class="mt-8 rounded-2xl border border-border bg-card shadow-[0_8px_30px_-15px_oklch(0.16_0.02_250/0.15)] focus-within:border-accent focus-within:shadow-[0_0_0_3px_oklch(0.72_0.15_55/0.15),0_20px_60px_-20px_oklch(0.16_0.02_250/0.3)] transition-[border-color,box-shadow] duration-200 fade-in [animation-delay:200ms]"
      onsubmit={(e) => { e.preventDefault(); start(draft); }}
    >
      <textarea
        bind:value={draft}
        placeholder="e.g. Cracks appeared on my Georgian townhouse after works next door…"
        rows={3}
        class="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-base placeholder:text-muted-foreground outline-none"
        onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); start(draft); } }}
      ></textarea>
      <div class="flex items-center justify-between px-4 pb-4 pt-1">
        <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          {focusSurvey ? `${focusSurvey.id} context loaded` : 'Shift + return for new line'}
        </span>
        <button
          type="submit"
          disabled={!draft.trim()}
          class="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.22em] transition active:scale-[0.97] hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:pointer-events-none"
        >
          Start brief →
        </button>
      </div>
    </form>
  </section>

  <!-- ── Mode tabs ────────────────────────────────────────────── -->
  <section class="mx-auto w-full max-w-4xl px-6 pb-14">

    <div class="flex items-center gap-1 mb-6 p-1 rounded-full bg-secondary/60 w-fit">
      <button
        onclick={() => (mode = 'briefs')}
        class="px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.22em] transition-all duration-200
               {mode === 'briefs'
                 ? 'bg-background text-foreground shadow-sm'
                 : 'text-muted-foreground hover:text-foreground'}"
      >
        Quick briefs
      </button>
      <button
        onclick={() => (mode = 'explore')}
        class="px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.22em] transition-all duration-200
               {mode === 'explore'
                 ? 'bg-background text-foreground shadow-sm'
                 : 'text-muted-foreground hover:text-foreground'}"
      >
        Explore surveys
        <span class="ml-1.5 text-[9px] opacity-60">{data.services.length}</span>
      </button>
    </div>

    <!-- ── Quick briefs ── -->
    {#if mode === 'briefs'}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each suggestions as s, i}
          {@const Icon = s.icon}
          {@const event = pickEvent(s.seismicType)}
          <button
            onclick={() => start(s.prompt)}
            class="group text-left rounded-xl border border-border bg-card card-hover active:scale-[0.97] rise overflow-hidden"
            style="animation-delay: {i * 40}ms"
          >
            <div class="p-5">
              <div class="flex items-start justify-between mb-4">
                <div class="rounded-md bg-secondary p-2">
                  <Icon class="h-4 w-4 text-accent" />
                </div>
                <span class="text-[10px] font-mono text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p class="text-base font-semibold leading-snug">{s.label}</p>
              <p class="mt-1 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">{s.hint}</p>
              <p class="mt-3 text-sm text-muted-foreground line-clamp-2">{s.prompt}</p>
            </div>

            <!-- Seismic footer pill -->
            <div class="border-t border-border bg-secondary/40 px-5 py-3 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 min-w-0">
                <span class="relative flex h-1.5 w-1.5 shrink-0">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60"></span>
                  <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
                </span>
                {#if event}
                  <span class="text-[10px] font-mono text-muted-foreground truncate">
                    <span class="font-semibold {magClass(event.magnitude)}">M{event.magnitude}</span>
                    · {shortPlace(event.place)} · {timeAgo(event.time_ms)}
                  </span>
                {:else if !seismic}
                  <span class="text-[10px] font-mono text-muted-foreground">Loading…</span>
                {:else}
                  <span class="text-[10px] font-mono text-muted-foreground">No regional activity</span>
                {/if}
              </div>
              <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground group-hover:text-accent transition-colors shrink-0">Ask →</span>
            </div>

            {#if event}
              <div class="px-5 py-2 bg-secondary/20 border-t border-border/50">
                <p class="text-[10px] font-mono text-muted-foreground/70">{s.seismicContext}</p>
              </div>
            {/if}
          </button>
        {/each}
      </div>

    <!-- ── Explore surveys ── -->
    {:else}
      <!-- Search + category filters -->
      <div class="space-y-3 mb-5">
        <div class="relative">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            bind:value={query}
            type="search"
            placeholder="Search by name, ID, category or region…"
            class="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground outline-none focus:border-accent transition-colors duration-150"
          />
        </div>

        <!-- Category chips -->
        <div class="flex flex-wrap gap-2">
          <button
            onclick={() => (activeCat = null)}
            class="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.22em] border transition-colors duration-150
                   {activeCat === null
                     ? 'border-foreground bg-foreground text-background'
                     : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'}"
          >All</button>
          {#each categories as cat}
            <button
              onclick={() => (activeCat = activeCat === cat ? null : cat)}
              class="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.22em] border transition-colors duration-150
                     {activeCat === cat
                       ? 'border-accent bg-accent/10 text-accent'
                       : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'}"
            >{cat}</button>
          {/each}
        </div>
      </div>

      <!-- Survey count -->
      <p class="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground mb-4">
        {filteredServices.length} survey{filteredServices.length === 1 ? '' : 's'}
        {activeCat ? `· ${activeCat}` : ''}
        {query ? `· "${query}"` : ''}
      </p>

      <!-- Survey grid -->
      {#if filteredServices.length}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {#each filteredServices as s}
            {@const isSelected = focusSurvey?.id === s.id}
            <div
              role="button"
              tabindex="0"
              onclick={() => selectSurvey(s)}
              onkeydown={(e) => e.key === 'Enter' && selectSurvey(s)}
              class="group relative text-left rounded-xl border overflow-hidden transition-all duration-200 active:scale-[0.97] cursor-pointer
                     {isSelected
                       ? 'border-accent bg-accent/5 shadow-[0_0_0_2px_oklch(0.72_0.15_55/0.2)]'
                       : 'border-border bg-card hover:border-foreground/30 card-hover'}"
            >
              <!-- Category colour stripe -->
              <div class="absolute left-0 top-0 bottom-0 w-[3px] {categoryAccent[s.category] ?? 'bg-accent'} opacity-70"></div>

              <div class="pl-5 pr-4 pt-4 pb-3">
                <!-- ID + slots -->
                <div class="flex items-start justify-between gap-2 mb-2">
                  <span class="text-[10px] font-mono uppercase tracking-[0.28em] {isSelected ? 'text-accent' : 'text-muted-foreground'}">{s.id}</span>
                  <span class="shrink-0 text-[9px] font-mono {s.slotsThisWeek === 0 ? 'text-muted-foreground/50' : s.slotsThisWeek <= 2 ? 'text-orange-500' : 'text-green-600'}">
                    {s.slotsThisWeek === 0 ? 'Waitlist' : `${s.slotsThisWeek} slot${s.slotsThisWeek === 1 ? '' : 's'}`}
                  </span>
                </div>

                <!-- Name -->
                <p class="text-sm font-semibold leading-snug {isSelected ? 'text-foreground' : ''}">{s.name}</p>

                <!-- Category + region -->
                <p class="mt-1.5 text-[10px] font-mono text-muted-foreground truncate">{s.category} · {s.region}</p>

                <!-- Fee + duration -->
                <div class="mt-3 flex items-center justify-between">
                  <span class="font-serif text-lg leading-none">{formatEur(s.feeEur)}</span>
                  <span class="text-[10px] font-mono text-muted-foreground">{s.durationDays}d turnaround</span>
                </div>
              </div>

              <!-- Selected CTA -->
              {#if isSelected}
                <div class="border-t border-accent/20 bg-accent/8 px-5 py-2.5 flex items-center justify-between">
                  <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-accent">Context loaded</span>
                  <button
                    onclick={(e) => { e.stopPropagation(); start(draft); }}
                    class="text-[10px] font-mono uppercase tracking-[0.22em] text-accent hover:text-foreground transition-colors"
                  >
                    Start brief →
                  </button>
                </div>
              {:else}
                <div class="border-t border-border/50 px-5 py-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <span class="text-[10px] font-mono text-muted-foreground">{s.availability}</span>
                  <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground">Select →</span>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-16 text-muted-foreground">
          <p class="text-sm">No surveys match your search.</p>
          <button onclick={() => { query = ''; activeCat = null; }} class="mt-3 text-[11px] font-mono uppercase tracking-[0.25em] text-accent hover:underline">
            Clear filters
          </button>
        </div>
      {/if}
    {/if}

  </section>
</div>
