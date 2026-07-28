<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';

  let { data } = $props();

  const equipmentImg = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1280&q=80&auto=format&fit=crop';

  const rows = $derived(() => {
    const regions = Array.from(new Set(data.services.map((s) => s.region))).sort();
    return regions.map((r, i) => ({
      name: r,
      index: i,
      count: data.services.filter((s) => s.region === r).length,
      disciplines: Array.from(new Set(data.services.filter((s) => s.region === r).map((s) => s.category))),
    }));
  });
</script>

<svelte:head>
  <title>Regions — Rockwell Site Surveys</title>
  <meta name="description" content="Rockwell operates across fifteen Irish counties from three yards: Dublin, Cork Harbour and Galway." />
</svelte:head>

<div>
  <PageHeader
    num="02"
    eyebrow="Coverage"
    lede="Field crews rotate weekly from three yards — Dublin, Galway, and Cork Harbour — covering fifteen counties across the Republic. Same-week slots are common in the east; two- to four-week leads apply for the western seaboard."
  >
    {#snippet title()}
      On the ground,<br /><em class="not-italic text-accent">nationwide.</em>
    {/snippet}
    {#snippet meta()}
      <figure class="overflow-hidden rounded-md grain max-w-sm md:ml-auto">
        <img
          src={equipmentImg}
          alt="Total station theodolite on a tripod against a moody Irish landscape"
          width={1280}
          height={1600}
          loading="lazy"
          class="w-full h-64 object-cover"
        />
      </figure>
    {/snippet}
  </PageHeader>

  <section class="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-md overflow-hidden border border-border">
      {#each rows() as r, i}
        <li
          class="bg-background p-6 md:p-8 flex flex-col justify-between min-h-52 hover:bg-primary hover:text-primary-foreground transition-colors group rise"
          style="animation-delay: {Math.min(i * 30, 400)}ms"
        >
          <div>
            <p class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground group-hover:text-primary-foreground/60">
              {String(i + 1).padStart(2, '0')} · County
            </p>
            <h2 class="mt-3 font-serif text-4xl md:text-5xl leading-none">{r.name}</h2>
          </div>
          <div class="mt-6 space-y-3">
            <p class="text-xs font-mono uppercase tracking-widest text-muted-foreground group-hover:text-primary-foreground/60">
              {r.count} {r.count === 1 ? 'service' : 'services'} · {r.disciplines.length} disciplines
            </p>
            <ul class="flex flex-wrap gap-1.5">
              {#each r.disciplines as d}
                <li class="text-[10px] font-mono uppercase tracking-widest border border-border group-hover:border-primary-foreground/30 px-2 py-1 rounded-sm">
                  {d}
                </li>
              {/each}
            </ul>
            <a
              href="/services"
              class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest border-b border-current pb-0.5 mt-2 group-hover:text-accent"
            >
              Services in {r.name} →
            </a>
          </div>
        </li>
      {/each}
    </ul>
  </section>
</div>
