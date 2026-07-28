<script lang="ts">
  import { imageFor, formatEur } from '$lib/services';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let s = $derived(data.service);
  let related = $derived(
    data.services.filter((x) => x.category === s.category && x.id !== s.id).slice(0, 3)
  );

  const specRows = $derived([
    ['Service ID', s.id],
    ['Discipline', s.category],
    ['Region', s.region],
    ['Duration', `${s.durationDays} ${s.durationDays === 1 ? 'day' : 'days'}`],
    ['Availability', s.availability],
    ['Slots this week', s.slotsThisWeek === 0 ? 'Waitlist' : String(s.slotsThisWeek)],
    ['Fee', formatEur(s.feeEur)],
    ['Report format', 'Signed PDF'],
    ['Insurance', '€13m PI'],
  ] as [string, string][]);
</script>

<svelte:head>
  <title>{s.name} — Rockwell Site Surveys</title>
  <meta name="description" content={s.description} />
  <meta property="og:image" content={imageFor(s)} />
</svelte:head>

<div>
  <!-- Breadcrumb -->
  <div class="border-b border-border">
    <div class="mx-auto max-w-[1400px] px-6 py-4 flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
      <a href="/" class="hover:text-foreground transition-colors duration-150">Index</a>
      <span>/</span>
      <a href="/services" class="hover:text-foreground transition-colors duration-150">Services</a>
      <span>/</span>
      <span class="text-foreground">{s.id}</span>
    </div>
  </div>

  <!-- Hero -->
  <section class="border-b border-border">
    <div class="mx-auto max-w-[1400px] px-6 pt-14 md:pt-20 pb-12 grid grid-cols-12 gap-6 items-end">
      <div class="col-span-12 md:col-span-8 rise">
        <div class="flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <span class="text-accent">{s.id}</span>
          <span class="h-px w-8 bg-foreground/30"></span>
          <span>{s.category} · {s.region}</span>
        </div>
        <h1 class="mt-8 font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95]">
          {s.name}
        </h1>
        {#if s.specialOffer}
          <p class="mt-6 inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1.5 rounded-sm text-xs font-medium">
            ✦ {s.specialOffer}
          </p>
        {/if}
      </div>
      <div class="col-span-12 md:col-span-4 md:text-right fade-in [animation-delay:150ms]">
        <p class="font-serif text-6xl md:text-7xl leading-none">{formatEur(s.feeEur)}</p>
        <p class="mt-2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Fixed fee · signed report included
        </p>
      </div>
    </div>

    <figure class="mx-auto max-w-[1400px] px-6 pb-16 fade-in [animation-delay:250ms]">
      <div class="overflow-hidden rounded-md grain">
        <img
          src={imageFor(s)}
          alt={s.name}
          class="w-full h-[52vh] md:h-[68vh] object-cover"
        />
      </div>
    </figure>
  </section>

  <!-- Body -->
  <section class="mx-auto max-w-[1400px] px-6 py-16 md:py-24 grid grid-cols-12 gap-10">
    <div class="col-span-12 md:col-span-7">
      <p class="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
        <span class="text-accent">§</span> Brief
      </p>
      <p class="mt-6 font-serif text-3xl md:text-4xl leading-[1.15] text-foreground">
        {s.description}
      </p>
      <div class="mt-10 space-y-6 text-muted-foreground leading-relaxed">
        <p>
          This survey is booked by architects, solicitors, developers and homeowners across
          <span class="text-foreground">{s.region}</span> and surrounding counties. It is
          delivered on-site by a chartered engineer with calibrated instruments, and issued
          as a signed PDF report suitable for planning, insurance and legal use.
        </p>
        <p>
          Typical turnaround is <span class="text-foreground">{s.durationDays} {s.durationDays === 1 ? 'day' : 'days'}</span> from
          site visit to signed report. Availability this week: <span class="text-foreground">{s.availability}</span>.
        </p>
      </div>

      <div class="mt-10 flex flex-wrap gap-3">
        <a
          href="/contact"
          class="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3.5 rounded-full text-sm font-medium hover:bg-accent hover:text-accent-foreground transition active:scale-[0.97]"
        >
          Book {s.id} <span aria-hidden="true">→</span>
        </a>
        <a
          href="/services"
          class="inline-flex items-center gap-2 border border-border px-6 py-3.5 rounded-full text-sm hover:border-foreground transition active:scale-[0.97]"
        >
          ← Back to catalogue
        </a>
      </div>
    </div>

    <aside class="col-span-12 md:col-span-5 md:pl-8 md:border-l border-border">
      <p class="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
        <span class="text-accent">§</span> Spec sheet
      </p>
      <dl class="mt-6 divide-y divide-border border-y border-border">
        {#each specRows as [k, v]}
          <div class="grid grid-cols-2 gap-4 py-3.5">
            <dt class="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground self-center">{k}</dt>
            <dd class="text-right font-serif text-lg {k === 'Slots this week' && s.slotsThisWeek === 0 ? 'text-accent' : ''}">{v}</dd>
          </div>
        {/each}
      </dl>
    </aside>
  </section>

  <!-- Related -->
  {#if related.length > 0}
    <section class="border-t border-border bg-secondary/50">
      <div class="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <p class="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <span class="text-accent">§</span> Related in {s.category}
        </p>
        <ul class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each related as r}
            <li>
              <a
                href="/services/{r.id}"
                class="group card-hover block bg-card border border-border rounded-md overflow-hidden"
              >
                <div class="aspect-[4/3] overflow-hidden">
                  <img
                    src={imageFor(r)}
                    alt={r.name}
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div class="p-5">
                  <p class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                    {r.id} · {r.region}
                  </p>
                  <h3 class="mt-2 font-serif text-xl leading-tight">{r.name}</h3>
                  <p class="mt-3 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </section>
  {/if}
</div>
