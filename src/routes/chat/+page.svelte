<script lang="ts">
  import { goto } from '$app/navigation';
  import { newThreadId } from '$lib/chat-storage';
  import { HardHat, Building2, Compass, Radio, Waves, Map } from 'lucide-svelte';

  type Suggestion = {
    icon: typeof HardHat;
    label: string;
    hint: string;
    prompt: string;
  };

  const suggestions: Suggestion[] = [
    {
      icon: HardHat,
      label: 'Pre-purchase check',
      hint: 'Residential · Dublin',
      prompt: "I'm buying a 1930s semi-detached in Dublin. Which Rockwell survey should I book and what will the engineer look for?",
    },
    {
      icon: Building2,
      label: 'Cracks in a gable wall',
      hint: 'Structural monitoring',
      prompt: 'There are diagonal cracks appearing on the gable wall of my house. How do I know if it\'s subsidence, and what monitoring do you recommend?',
    },
    {
      icon: Compass,
      label: 'Drone topo for a site',
      hint: '1.2 ha in Meath',
      prompt: 'I need a topographic survey of a 1.2 hectare greenfield site in Meath for a planning application. Can Rockwell fly it, and what deliverables do I get?',
    },
    {
      icon: Radio,
      label: 'GPR before excavation',
      hint: 'Buried utilities',
      prompt: "We're about to excavate for a new foundation in a Dublin city site. What does a GPR utility scan involve and how far ahead should I book?",
    },
    {
      icon: Waves,
      label: 'Flood risk assessment',
      hint: 'Cork Harbour',
      prompt: 'My planner asked for a site-specific flood risk assessment near Cork Harbour. What does Rockwell provide, what standards does it follow, and what is the typical turnaround?',
    },
    {
      icon: Map,
      label: 'Bridge principal inspection',
      hint: 'Rural road bridge',
      prompt: 'We manage a small rural road bridge in Donegal. Can Rockwell carry out a principal inspection and what capacity assessment do we get back?',
    },
  ];

  let draft = $state('');

  function start(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    const id = newThreadId();
    goto(`/chat/${id}?q=${encodeURIComponent(text)}`);
  }
</script>

<div class="flex-1 flex flex-col overflow-y-auto">
  <!-- Hero -->
  <section class="mx-auto w-full max-w-4xl px-6 pt-14 pb-8">
    <p class="text-xs font-mono uppercase tracking-[0.3em] text-accent">Rockwell · Survey desk</p>
    <h1 class="mt-6 font-serif text-6xl md:text-7xl leading-[0.95] rise">
      On-call<br />
      <em class="not-italic text-muted-foreground">chartered</em> engineer.
    </h1>
    <p class="mt-6 max-w-xl text-muted-foreground fade-in [animation-delay:150ms]">
      Describe your site, defect, or planning brief and get the survey
      recommendation, the standard it works to, and a realistic lead time.
    </p>

    <!-- Input -->
    <form
      class="mt-10 rounded-2xl border border-border bg-card shadow-[0_20px_60px_-30px_oklch(0.16_0.02_250/0.35)] focus-within:border-accent transition-colors duration-200 fade-in [animation-delay:250ms]"
      onsubmit={(e) => { e.preventDefault(); start(draft); }}
    >
      <textarea
        bind:value={draft}
        placeholder="e.g. Cracks appeared on my Georgian townhouse after works next door…"
        rows={3}
        class="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-base placeholder:text-muted-foreground outline-none"
        onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); start(draft); }}}
      ></textarea>
      <div class="flex items-center justify-between px-4 pb-4 pt-2">
        <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Shift + return for new line
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

  <!-- Suggestions -->
  <section class="mx-auto w-full max-w-4xl px-6 pb-14">
    <div class="flex items-baseline justify-between mb-5">
      <p class="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Common briefs</p>
      <span class="text-[10px] font-mono uppercase tracking-[0.3em] text-accent">Pick one to begin</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each suggestions as s, i}
        {@const Icon = s.icon}
        <button
          onclick={() => start(s.prompt)}
          class="group text-left rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_18px_40px_-24px_oklch(0.72_0.15_55/0.4)] active:scale-[0.98]"
          style="animation-delay: {i * 50}ms"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="rounded-md bg-secondary p-2">
              <Icon class="h-4 w-4 text-accent" />
            </div>
            <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
          <div class="font-serif text-lg leading-snug">{s.label}</div>
          <div class="mt-1 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">{s.hint}</div>
          <p class="mt-3 text-sm text-muted-foreground line-clamp-2">{s.prompt}</p>
          <div class="mt-4 text-[11px] font-mono uppercase tracking-[0.22em] text-foreground group-hover:text-accent transition-colors">
            Ask this →
          </div>
        </button>
      {/each}
    </div>
  </section>
</div>
