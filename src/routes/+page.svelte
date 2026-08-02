<script lang="ts">
  import { browser } from '$app/environment';
  import { imageFor, formatEur } from '$lib/services';
  import Reveal from '$lib/components/Reveal.svelte';

  let { data } = $props();

  const heroImg = 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1920&q=80&auto=format&fit=crop';

  const featured = $derived(
    ['RS001', 'RS009', 'RS016', 'RS021']
      .map((id) => data.services.find((s) => s.id === id))
      .filter((s) => s !== undefined)
  );

  const categories = $derived(Array.from(new Set(data.services.map((s) => s.category))).sort());
  const marqueeItems = $derived([...categories, ...categories]);

  const showcase = $derived([
    {
      title: "Instruments that don't guess.",
      body: "Robotic total stations, RTK GNSS, GPR arrays and survey-grade drones — calibrated, logged and traceable on every job.",
      img: imageFor(data.services.find((s) => s.id === 'RS016') ?? data.services[0]),
      tone: 'bg-card',
    },
    {
      title: "Reports signed by a person.",
      body: "Every conclusion carries the name of the chartered engineer who stood on your site. No boilerplate, no anonymous templates.",
      img: imageFor(data.services.find((s) => s.id === 'RS001') ?? data.services[0]),
      tone: 'bg-secondary',
    },
  ]);

  let heroFigure: HTMLElement | undefined = $state();
  let parallaxOffset = $state(0);

  $effect(() => {
    if (!browser) return;
    const onScroll = () => {
      if (!heroFigure) return;
      requestAnimationFrame(() => {
        const rect = heroFigure!.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        parallaxOffset = -center * 0.08;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  const stats = [
    { kpi: '30', label: 'Survey types' },
    { kpi: '15', label: 'Counties covered' },
    { kpi: '27yr', label: 'Field operations' },
    { kpi: '€13m', label: 'Professional cover' },
  ];
</script>

<svelte:head>
  <title>Rockwell Site Surveys — Structural &amp; Geotechnical Engineers, Ireland</title>
  <meta name="description" content="Chartered engineering surveys across Ireland — structural, geotechnical, drone, geophysical. Fixed fees, signed reports, honest lead times." />
</svelte:head>

<div class="overflow-x-clip">

  <!-- Hero -->
  <section class="relative bg-card">
    <div
      class="pointer-events-none absolute inset-x-0 -top-24 h-[420px] blur-3xl opacity-60 float-slow"
      style="background: radial-gradient(45% 60% at 30% 40%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%), radial-gradient(40% 55% at 72% 35%, color-mix(in oklab, var(--moss) 18%, transparent), transparent 70%)"
    ></div>

    <div class="relative mx-auto max-w-[900px] px-6 pt-24 md:pt-32 pb-12 text-center">
      <p class="rise text-[13px] font-medium text-accent">
        Chartered engineers · Ireland · Since 1998
      </p>
      <h1 class="rise [animation-delay:100ms] mt-5 text-[13vw] leading-[0.95] md:text-[6.5rem]">
        Ground truth,<br />
        <em class="text-gradient">measured.</em>
      </h1>
      <p class="fade-in [animation-delay:300ms] mx-auto mt-7 max-w-2xl text-lg md:text-2xl text-muted-foreground leading-relaxed">
        Thirty specialised surveys — structural, geotechnical, drone and
        geophysical — delivered with signed reports, fixed fees and lead times
        we actually keep.
      </p>
      <div class="fade-in [animation-delay:440ms] mt-9 flex flex-wrap items-center justify-center gap-3">
        <a href="/services" class="pill bg-accent text-accent-foreground px-7 py-3 text-[15px] font-medium">
          Browse 30 surveys
        </a>
        <a href="/contact" class="pill border border-border bg-background px-7 py-3 text-[15px] font-medium hover:border-foreground/40">
          Talk to an engineer ›
        </a>
      </div>
    </div>

    <figure bind:this={heroFigure} class="relative mx-auto max-w-[1280px] px-6 pb-20 md:pb-28">
      <div class="fade-in [animation-delay:560ms] relative overflow-hidden rounded-[28px] shadow-[0_50px_120px_-60px_oklch(0.19_0.005_260/0.65)]">
        <img
          src={heroImg}
          alt="Rockwell engineers running a total station and drone at a coastal Irish site at sunset"
          width={1920}
          height={1280}
          style="transform: translate3d(0, {parallaxOffset * 0.35}px, 0) scale(1.08)"
          class="w-full h-[54vh] md:h-[76vh] object-cover will-change-transform"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-5 text-primary-foreground">
          {#each [['Location', '53.3498° N · 6.2603° W'], ['Job', 'RS009 · Topographic'], ['Crew', 'M. Ryan · C. Ó Briain'], ['Weather', '9°C · SW 12kt · clear']] as [k, v]}
            <div>
              <p class="text-[10px] uppercase tracking-[0.18em] opacity-60">{k}</p>
              <p class="mt-1 text-xs md:text-sm font-medium">{v}</p>
            </div>
          {/each}
        </div>
      </div>
    </figure>
  </section>

  <!-- Stats -->
  <section class="mx-auto max-w-[1024px] px-6 py-20 md:py-28">
    <dl class="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6 text-center">
      {#each stats as stat, i}
        <Reveal delay={i * 90}>
          <dd class="text-5xl md:text-6xl font-semibold tracking-tight text-gradient">{stat.kpi}</dd>
          <dt class="mt-3 text-[13px] text-muted-foreground">{stat.label}</dt>
        </Reveal>
      {/each}
    </dl>
  </section>

  <!-- Showcase -->
  <section class="mx-auto max-w-[1280px] px-6 pb-10 grid gap-6 md:grid-cols-2">
    {#each showcase as p, i}
      <Reveal delay={i * 120} class="group relative overflow-hidden rounded-[28px] {p.tone} border border-border">
        <div class="p-8 md:p-12">
          <h2 class="text-3xl md:text-[2.6rem] max-w-sm">{p.title}</h2>
          <p class="mt-4 max-w-md text-muted-foreground leading-relaxed">{p.body}</p>
        </div>
        <div class="px-8 md:px-12 pb-8 md:pb-12">
          <div class="overflow-hidden rounded-2xl">
            <img
              src={p.img}
              alt={p.title}
              loading="lazy"
              class="h-64 w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
          </div>
        </div>
      </Reveal>
    {/each}
  </section>

  <!-- Marquee -->
  <div class="overflow-hidden border-y border-border bg-card py-8">
    <div class="flex whitespace-nowrap marquee-track">
      {#each marqueeItems as item}
        <span class="mx-6 flex items-center gap-6 text-2xl md:text-4xl font-semibold tracking-tight text-muted-foreground/50">
          {item}
          <span aria-hidden="true" class="text-accent text-lg">•</span>
        </span>
      {/each}
    </div>
  </div>

  <!-- Featured Grid -->
  <section class="mx-auto max-w-[1280px] px-6 py-20 md:py-28">
    <Reveal class="text-center max-w-2xl mx-auto">
      <p class="text-[13px] font-medium text-accent">Featured surveys</p>
      <h2 class="mt-4 text-4xl md:text-6xl">Four of thirty, chosen for you.</h2>
      <a href="/services" class="mt-6 inline-flex text-accent text-[15px] hover:underline underline-offset-4">
        See the full catalogue ›
      </a>
    </Reveal>

    <div class="mt-14 grid grid-cols-12 gap-6">
      {#each featured as s, i}
        <Reveal delay={i * 90} class={i === 0 ? 'col-span-12 md:col-span-8' : 'col-span-12 sm:col-span-6 md:col-span-4'}>
          <a
            href="/services/{s.id}"
            class="group card-hover block h-full overflow-hidden rounded-[24px] border border-border bg-card"
          >
            <div class="relative overflow-hidden {i === 0 ? 'aspect-[16/10]' : 'aspect-[4/3]'}">
              <img
                src={imageFor(s)}
                alt={s.name}
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <span class="absolute top-4 left-4 glass rounded-full px-3 py-1 text-[11px] font-medium">
                {s.id}
              </span>
              <span class="absolute top-4 right-4 rounded-full bg-accent text-accent-foreground px-3 py-1 text-[11px] font-medium">
                {formatEur(s.feeEur)}
              </span>
            </div>
            <div class="p-6 md:p-8">
              <p class="text-[12px] text-muted-foreground">{s.category} · {s.region}</p>
              <h3 class="mt-2 {i === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}">{s.name}</h3>
              <p class="mt-3 max-w-lg text-[15px] text-muted-foreground leading-relaxed line-clamp-3">{s.description}</p>
              <div class="mt-6 flex items-center justify-between text-[13px]">
                <span class="text-muted-foreground">{s.durationDays}d · {s.availability}</span>
                <span class="text-accent transition-transform duration-300 group-hover:translate-x-1">View ›</span>
              </div>
            </div>
          </a>
        </Reveal>
      {/each}
    </div>
  </section>

  <!-- Manifesto -->
  <section class="bg-primary text-primary-foreground">
    <div class="mx-auto max-w-[900px] px-6 py-28 md:py-40 text-center">
      <Reveal>
        <p class="text-[13px] font-medium text-accent">Our standard</p>
        <p class="mt-6 text-3xl md:text-5xl leading-[1.15] font-semibold tracking-tight">
          We survey ground the way a doctor reads a scan — carefully, on
          record, and with a name signed to every conclusion.
          <span class="text-primary-foreground/45">
            No boilerplate. No hidden fees. If we can't do the job, we tell you
            who can.
          </span>
        </p>
      </Reveal>
    </div>
  </section>

  <!-- Big CTA -->
  <section class="mx-auto max-w-[1280px] px-6 py-20 md:py-28">
    <div class="grid gap-6 md:grid-cols-2">
      <Reveal class="h-full">
        <a
          href="/regions"
          class="group card-hover flex h-full min-h-72 flex-col justify-between rounded-[28px] border border-border bg-card p-10 md:p-14"
        >
          <p class="text-[13px] font-medium text-accent">Coverage</p>
          <div>
            <h3 class="text-4xl md:text-5xl">Fifteen counties. Three yards.</h3>
            <p class="mt-4 text-muted-foreground">
              Dublin · Cork Harbour · Galway — plus rotating field crews nationwide.
            </p>
          </div>
          <span class="text-[15px] text-accent transition-transform duration-300 group-hover:translate-x-1">
            See regions ›
          </span>
        </a>
      </Reveal>
      <Reveal delay={120} class="h-full">
        <a
          href="/process"
          class="group card-hover flex h-full min-h-72 flex-col justify-between rounded-[28px] bg-primary p-10 md:p-14 text-primary-foreground"
        >
          <p class="text-[13px] font-medium text-accent">Workflow</p>
          <div>
            <h3 class="text-4xl md:text-5xl">Four steps. Zero surprises.</h3>
            <p class="mt-4 text-primary-foreground/60">
              Brief → site day → signed report → follow-up. Quoted times honoured.
            </p>
          </div>
          <span class="text-[15px] text-accent transition-transform duration-300 group-hover:translate-x-1">
            See process ›
          </span>
        </a>
      </Reveal>
    </div>
  </section>

</div>
