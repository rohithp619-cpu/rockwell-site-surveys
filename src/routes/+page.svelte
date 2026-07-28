<script lang="ts">
  import { imageFor, formatEur } from '$lib/services';

  let { data } = $props();

  const heroImg = 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1920&q=80&auto=format&fit=crop';

  const featured = $derived(
    ['RS001', 'RS009', 'RS016', 'RS021']
      .map((id) => data.services.find((s) => s.id === id))
      .filter((s) => s !== undefined)
  );

  const categories = $derived(Array.from(new Set(data.services.map((s) => s.category))).sort());
  const marqueeItems = $derived([...categories, ...categories]);
</script>

<svelte:head>
  <title>Rockwell Site Surveys — Structural &amp; Geotechnical Engineers, Ireland</title>
  <meta name="description" content="Chartered engineering surveys across Ireland — structural, geotechnical, drone, geophysical. Fixed fees, signed reports, honest lead times." />
</svelte:head>

<div>
  <!-- Hero -->
  <section class="relative border-b border-border overflow-hidden">
    <div class="mx-auto max-w-[1400px] px-6 pt-14 md:pt-20 pb-10 md:pb-16 grid grid-cols-12 gap-6">
      <div class="col-span-12 md:col-span-8 rise">
        <div class="flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <span class="text-accent">§ 00 — Index</span>
          <span class="h-px w-10 bg-foreground/30"></span>
          <span>Est. 1998 · Chartered Engineers · Ireland</span>
        </div>
        <h1 class="mt-8 font-serif leading-[0.9] text-[15vw] md:text-[10rem] lg:text-[13rem] tracking-[-0.03em]">
          Ground<br />
          truth,<br />
          <em class="not-italic text-accent">measured.</em>
        </h1>
      </div>
      <aside class="col-span-12 md:col-span-4 md:pl-8 md:border-l md:border-border flex flex-col justify-between fade-in [animation-delay:200ms]">
        <p class="text-base md:text-lg text-muted-foreground leading-relaxed">
          Rockwell is a chartered structural &amp; geotechnical practice working across Ireland — from Donegal cliffs to Cork harbour. Thirty specialised surveys. Signed reports. Honest lead times.
        </p>
        <dl class="mt-10 grid grid-cols-3 gap-4">
          <div>
            <dt class="sr-only">Survey types</dt>
            <dd class="font-serif text-4xl leading-none">30</dd>
            <p class="mt-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Survey types</p>
          </div>
          <div>
            <dt class="sr-only">Counties</dt>
            <dd class="font-serif text-4xl leading-none">15</dd>
            <p class="mt-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Counties</p>
          </div>
          <div>
            <dt class="sr-only">Field ops</dt>
            <dd class="font-serif text-4xl leading-none">27yr</dd>
            <p class="mt-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Field ops</p>
          </div>
        </dl>
        <div class="mt-10 flex flex-col gap-3">
          <a href="/services" class="group inline-flex items-center justify-between gap-4 bg-primary text-primary-foreground px-5 py-4 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
            <span class="text-sm font-medium">Browse 30 surveys</span>
            <span aria-hidden="true" class="font-mono transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a href="/contact" class="group inline-flex items-center justify-between gap-4 border border-border px-5 py-4 rounded-md hover:border-foreground transition-colors">
            <span class="text-sm font-medium">Talk to an engineer</span>
            <span aria-hidden="true" class="font-mono">↗</span>
          </a>
        </div>
      </aside>
    </div>

    <figure class="relative mx-auto max-w-[1400px] px-6 pb-16 md:pb-24 fade-in [animation-delay:350ms]">
      <div class="relative overflow-hidden rounded-md grain">
        <img
          src={heroImg}
          alt="Rockwell engineers running a total station and drone at a coastal Irish site at sunset"
          width={1920}
          height={1280}
          class="w-full h-[52vh] md:h-[72vh] object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
          {#each [['Location', '53.3498° N · 6.2603° W'], ['Job', 'RS009 · Topographic'], ['Crew', 'M. Ryan · C. Ó Briain'], ['Weather', '9°C · SW 12kt · clear']] as [k, v]}
            <div>
              <p class="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60">{k}</p>
              <p class="mt-1 font-mono text-xs md:text-sm">{v}</p>
            </div>
          {/each}
        </div>
      </div>
    </figure>
  </section>

  <!-- Marquee -->
  <div class="border-b border-border bg-primary text-primary-foreground overflow-hidden">
    <div class="flex whitespace-nowrap marquee-track py-6">
      {#each marqueeItems as item}
        <span class="mx-8 font-serif text-3xl md:text-4xl flex items-center gap-8">
          {item}
          <span aria-hidden="true" class="text-accent text-2xl">✦</span>
        </span>
      {/each}
    </div>
  </div>

  <!-- Featured Grid -->
  <section class="mx-auto max-w-[1400px] px-6 py-20 md:py-32">
    <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
      <div>
        <p class="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <span class="text-accent">§ 01</span> — Featured surveys
        </p>
        <h2 class="mt-4 font-serif text-5xl md:text-7xl leading-[0.95]">
          Four of thirty,<br />
          <em class="not-italic text-accent">chosen for you.</em>
        </h2>
      </div>
      <a
        href="/services"
        class="self-start md:self-end inline-flex items-center gap-2 text-sm border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
      >
        See the full catalogue →
      </a>
    </header>

    <div class="grid grid-cols-12 gap-6">
      {#each featured as s, i}
        <a
          href="/services/{s.id}"
          class="group card-hover bg-card rounded-md overflow-hidden border border-border {i === 0 ? 'col-span-12 md:col-span-8 md:row-span-2' : 'col-span-12 sm:col-span-6 md:col-span-4'}"
        >
          <div class="relative overflow-hidden {i === 0 ? 'aspect-[16/11]' : 'aspect-[4/3]'}">
            <img
              src={imageFor(s)}
              alt={s.name}
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span class="absolute top-3 left-3 bg-background/90 text-foreground px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest">
              {s.id}
            </span>
            <span class="absolute top-3 right-3 bg-accent text-accent-foreground px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest">
              {formatEur(s.feeEur)}
            </span>
          </div>
          <div class="p-5 md:p-6">
            <p class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              {s.category} · {s.region}
            </p>
            <h3 class="mt-2 font-serif leading-tight {i === 0 ? 'text-3xl md:text-5xl' : 'text-2xl'}">
              {s.name}
            </h3>
            {#if i === 0}
              <p class="mt-4 text-muted-foreground max-w-lg leading-relaxed">{s.description}</p>
            {/if}
            <div class="mt-5 flex items-center justify-between text-xs font-mono uppercase tracking-widest">
              <span class="text-muted-foreground">{s.durationDays}d · {s.availability}</span>
              <span class="text-foreground group-hover:text-accent transition-colors">View →</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <!-- Manifesto -->
  <section class="border-y border-border bg-secondary/60">
    <div class="mx-auto max-w-[1400px] px-6 py-24 md:py-32 grid grid-cols-12 gap-6">
      <p class="col-span-12 md:col-span-3 text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
        <span class="text-accent">§ 02</span><br />Manifesto
      </p>
      <p class="col-span-12 md:col-span-9 font-serif text-3xl md:text-5xl lg:text-6xl leading-[1.05] text-foreground">
        We survey ground the way a doctor reads a scan — <em class="not-italic text-accent">carefully, on record,</em> and with a name signed to every conclusion. No boilerplate. No hidden fees. If we can't do the job, we tell you who can.
      </p>
    </div>
  </section>

  <!-- Big CTA -->
  <section class="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
    <div class="grid md:grid-cols-2 gap-4">
      <a href="/regions" class="group card-hover relative overflow-hidden rounded-md border border-border bg-card p-8 md:p-12 min-h-72 flex flex-col justify-between">
        <p class="text-[11px] font-mono uppercase tracking-[0.3em] text-accent">Coverage</p>
        <div>
          <h3 class="font-serif text-4xl md:text-6xl leading-[0.95]">
            Fifteen counties.<br /><em class="not-italic text-muted-foreground">Three yards.</em>
          </h3>
          <p class="mt-4 text-sm text-muted-foreground">
            Dublin · Cork Harbour · Galway — plus rotating field crews nationwide.
          </p>
        </div>
        <span class="text-sm font-mono uppercase tracking-widest group-hover:text-accent transition-colors">See regions →</span>
      </a>
      <a href="/process" class="group card-hover relative overflow-hidden rounded-md border border-border bg-primary text-primary-foreground p-8 md:p-12 min-h-72 flex flex-col justify-between">
        <p class="text-[11px] font-mono uppercase tracking-[0.3em] text-accent">Workflow</p>
        <div>
          <h3 class="font-serif text-4xl md:text-6xl leading-[0.95]">
            Four steps.<br /><em class="not-italic text-accent">Zero surprises.</em>
          </h3>
          <p class="mt-4 text-sm text-primary-foreground/70">
            Brief → site day → signed report → follow-up. Quoted times honoured.
          </p>
        </div>
        <span class="text-sm font-mono uppercase tracking-widest group-hover:text-accent transition-colors">See process →</span>
      </a>
    </div>
  </section>
</div>
