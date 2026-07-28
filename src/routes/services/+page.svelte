<script lang="ts">
  import { formatEur, imageFor } from '$lib/services';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let { data } = $props();

  let cat = $state('All');
  let region = $state('All');
  let sort = $state<'fee-asc' | 'fee-desc' | 'duration' | 'slots'>('fee-asc');

  const categories = $derived(Array.from(new Set(data.services.map((s) => s.category))).sort());
  const regions = $derived(Array.from(new Set(data.services.map((s) => s.region))).sort());

  let filtered = $derived.by(() => {
    let list = data.services.filter(
      (s) =>
        (cat === 'All' || s.category === cat) &&
        (region === 'All' || s.region === region)
    );
    return [...list].sort((a, b) => {
      if (sort === 'fee-asc') return a.feeEur - b.feeEur;
      if (sort === 'fee-desc') return b.feeEur - a.feeEur;
      if (sort === 'duration') return a.durationDays - b.durationDays;
      return b.slotsThisWeek - a.slotsThisWeek;
    });
  });

  const sortOptions = [
    ['fee-asc', 'Fee ↑'],
    ['fee-desc', 'Fee ↓'],
    ['duration', 'Fast'],
    ['slots', 'Slots'],
  ] as const;
</script>

<svelte:head>
  <title>Services — Rockwell Site Surveys</title>
  <meta name="description" content="Thirty specialised engineering surveys across Ireland with fixed fees, live weekly availability and signed reports." />
</svelte:head>

<div>
  <PageHeader
    num="01"
    eyebrow="Catalogue"
    lede="Every service is delivered by a chartered engineer, priced up front and issued as a signed PDF report. Slots reflect live availability for this week."
  >
    {#snippet title()}
      Thirty surveys.<br /><em class="not-italic text-accent">Fixed fees.</em>
    {/snippet}
    {#snippet meta()}
      <dl class="grid grid-cols-2 gap-4">
        <div>
          <dt class="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Disciplines</dt>
          <dd class="mt-1 font-serif text-2xl">{categories.length}</dd>
        </div>
        <div>
          <dt class="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Counties</dt>
          <dd class="mt-1 font-serif text-2xl">{regions.length}</dd>
        </div>
        <div>
          <dt class="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Fee range</dt>
          <dd class="mt-1 font-serif text-2xl">€380 – €12.5k</dd>
        </div>
        <div>
          <dt class="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Turnaround</dt>
          <dd class="mt-1 font-serif text-2xl">1 – 30 days</dd>
        </div>
      </dl>
    {/snippet}
  </PageHeader>

  <!-- Filters -->
  <div class="sticky top-16 z-30 bg-background/90 backdrop-blur-md border-b border-border">
    <div class="mx-auto max-w-[1400px] px-6 py-4 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.2em]">
      <label class="flex items-center gap-2 text-muted-foreground">
        <span>Discipline</span>
        <select
          bind:value={cat}
          class="bg-background border border-border rounded-sm px-2.5 py-1.5 text-foreground uppercase tracking-widest focus:outline-none focus:border-accent"
        >
          {#each ['All', ...categories] as opt}
            <option value={opt}>{opt}</option>
          {/each}
        </select>
      </label>
      <label class="flex items-center gap-2 text-muted-foreground">
        <span>Region</span>
        <select
          bind:value={region}
          class="bg-background border border-border rounded-sm px-2.5 py-1.5 text-foreground uppercase tracking-widest focus:outline-none focus:border-accent"
        >
          {#each ['All', ...regions] as opt}
            <option value={opt}>{opt}</option>
          {/each}
        </select>
      </label>
      <div class="ml-auto flex items-center gap-2 text-muted-foreground">
        <span>Sort</span>
        {#each sortOptions as [k, l]}
          <button
            onclick={() => (sort = k)}
            class="px-2.5 py-1.5 rounded-sm border transition active:scale-[0.97] {sort === k ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-foreground text-foreground'}"
          >
            {l}
          </button>
        {/each}
      </div>
      <span class="w-full md:w-auto md:ml-4 text-muted-foreground normal-case tracking-normal font-sans text-xs">
        Showing <span class="text-foreground font-medium">{filtered.length}</span> of {data.services.length}
      </span>
    </div>
  </div>

  <!-- Product grid -->
  <section class="mx-auto max-w-[1400px] px-6 py-14">
    {#if filtered.length === 0}
      <p class="py-24 text-center text-muted-foreground">No services match that filter.</p>
    {:else}
      <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filtered as s, i}
          {@const slots = s.slotsThisWeek}
          {@const slotLabel = slots === 0 ? 'Waitlist' : `${slots} slot${slots === 1 ? '' : 's'} this wk`}
          {@const slotCls = slots === 0 ? 'bg-destructive text-destructive-foreground' : slots <= 2 ? 'bg-primary text-primary-foreground' : 'bg-background/95 text-foreground'}
          <li class="rise" style="animation-delay: {Math.min(i * 40, 400)}ms">
            <a
              href="/services/{s.id}"
              class="group block card-hover bg-card border border-border rounded-md overflow-hidden h-full flex flex-col"
            >
              <div class="relative overflow-hidden aspect-[4/3] bg-secondary">
                <img
                  src={imageFor(s)}
                  alt={s.name}
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="absolute top-3 left-3 bg-background/95 text-foreground px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest">
                  {s.id}
                </span>
                {#if s.specialOffer}
                  <span class="absolute top-3 right-3 bg-accent text-accent-foreground px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest">
                    ✦ Offer
                  </span>
                {/if}
                <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest {slotCls}">
                  {slotLabel}
                </span>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <p class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                  {s.category} · {s.region}
                </p>
                <h3 class="mt-2 font-serif text-2xl leading-tight">{s.name}</h3>
                <p class="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {s.description}
                </p>
                <div class="mt-5 pt-4 border-t border-border flex items-baseline justify-between">
                  <div>
                    <span class="font-serif text-2xl">{formatEur(s.feeEur)}</span>
                    <span class="ml-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {s.durationDays}d
                    </span>
                  </div>
                  <span class="text-xs font-mono uppercase tracking-widest text-foreground group-hover:text-accent transition-colors">
                    View →
                  </span>
                </div>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>
