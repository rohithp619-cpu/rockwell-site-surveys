<script lang="ts">
  import { imageFor, formatEur } from '$lib/services';
  import Reveal from '$lib/components/Reveal.svelte';

  let { data } = $props();

  const offers = $derived(
    data.services
      .filter((s) => s.specialOffer)
      .map((s) => ({ ...s, offer: s.specialOffer! }))
  );

  const tones = [
    { bg: 'bg-accent', text: 'text-accent-foreground', badge: 'bg-primary text-primary-foreground' },
    { bg: 'bg-card', text: 'text-foreground', badge: 'bg-accent text-accent-foreground' },
    { bg: 'bg-primary', text: 'text-primary-foreground', badge: 'bg-accent text-accent-foreground' },
    { bg: 'bg-secondary', text: 'text-foreground', badge: 'bg-primary text-primary-foreground' },
    { bg: 'bg-card', text: 'text-foreground', badge: 'bg-accent text-accent-foreground' },
  ];
</script>

<svelte:head>
  <title>Current Offers — Rockwell Site Surveys</title>
  <meta name="description" content="Live promotional offers from Rockwell Site Surveys — discounts, free add-ons and priority slots across our engineering survey catalogue." />
</svelte:head>

<div class="overflow-x-clip">

  <!-- Campaign hero -->
  <section class="relative bg-primary text-primary-foreground overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 opacity-30 float-slow"
      style="background: radial-gradient(60% 80% at 20% 50%, color-mix(in oklab, var(--accent) 40%, transparent), transparent 70%), radial-gradient(50% 70% at 80% 30%, color-mix(in oklab, var(--moss) 30%, transparent), transparent 70%)"
    ></div>

    <div class="relative mx-auto max-w-[900px] px-6 pt-24 md:pt-32 pb-16 text-center">
      <p class="rise inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.3em] text-accent">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
        Live offers · Updated from catalogue
      </p>
      <h1 class="rise [animation-delay:100ms] mt-6 text-[12vw] leading-[0.92] md:text-[6rem]">
        The Ground<br />
        <em class="text-gradient" style="background-image: linear-gradient(100deg, oklch(0.99 0 0) 0%, color-mix(in oklab, oklch(0.99 0 0) 55%, var(--accent)) 50%, oklch(0.99 0 0) 100%); -webkit-background-clip: text; background-clip: text; color: transparent;">
          Campaign.
        </em>
      </h1>
      <p class="fade-in [animation-delay:280ms] mx-auto mt-7 max-w-xl text-lg text-primary-foreground/70 leading-relaxed">
        A rotating set of offers across the Rockwell catalogue — pulled live
        from our survey desk. Book during the window and the saving is locked
        into your quote.
      </p>
      <div class="fade-in [animation-delay:400ms] mt-6 flex items-center justify-center gap-6 text-[12px] font-mono uppercase tracking-[0.25em] text-primary-foreground/50">
        <span>{offers.length} active offers</span>
        <span class="h-px w-8 bg-current"></span>
        <span>Fixed fees · signed reports</span>
      </div>
    </div>

    <!-- Offer count pills -->
    <div class="fade-in [animation-delay:520ms] relative mx-auto max-w-[900px] px-6 pb-16 flex flex-wrap justify-center gap-3">
      {#each offers as o}
        <span class="glass rounded-full px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-primary-foreground/80">
          {o.id} · {o.name}
        </span>
      {/each}
    </div>
  </section>

  <!-- Offer cards — alternating campaign layout -->
  <section class="mx-auto max-w-[1280px] px-6 py-16 md:py-24 space-y-8">
    {#each offers as o, i}
      {@const tone = tones[i % tones.length]}
      <Reveal delay={i * 80}>
        <article class="group overflow-hidden rounded-[28px] border border-border grid md:grid-cols-2 {i % 2 === 1 ? 'md:[&>*:first-child]:order-last' : ''}">

          <!-- Image side -->
          <div class="relative overflow-hidden min-h-72 md:min-h-auto">
            <img
              src={imageFor(o)}
              alt={o.name}
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent"></div>
            <div class="absolute top-5 left-5 flex gap-2">
              <span class="rounded-full glass px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-primary-foreground">
                {o.id}
              </span>
              <span class="rounded-full bg-rust text-primary-foreground px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
                ✦ Offer
              </span>
            </div>
            <div class="absolute bottom-5 left-5">
              <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-primary-foreground/60">{o.category}</p>
              <p class="mt-1 text-2xl font-semibold text-primary-foreground">{formatEur(o.feeEur)}</p>
            </div>
          </div>

          <!-- Content side -->
          <div class="{tone.bg} {tone.text} p-8 md:p-12 flex flex-col justify-between">
            <div>
              <!-- Campaign badge -->
              <span class="inline-flex items-center gap-2 {tone.badge} rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]">
                <span class="h-1.5 w-1.5 rounded-full bg-current opacity-80"></span>
                {o.offer}
              </span>

              <h2 class="mt-6 text-3xl md:text-4xl leading-tight">{o.name}</h2>
              <p class="mt-4 text-[15px] leading-relaxed opacity-70">{o.description}</p>

              <dl class="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt class="text-[10px] font-mono uppercase tracking-[0.22em] opacity-50">Region</dt>
                  <dd class="mt-1 font-semibold">{o.region}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-mono uppercase tracking-[0.22em] opacity-50">Turnaround</dt>
                  <dd class="mt-1 font-semibold">{o.durationDays} {o.durationDays === 1 ? 'day' : 'days'}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-mono uppercase tracking-[0.22em] opacity-50">Slots this week</dt>
                  <dd class="mt-1 font-semibold {o.slotsThisWeek === 0 ? 'text-rust' : ''}">
                    {o.slotsThisWeek === 0 ? 'Waitlist' : o.slotsThisWeek}
                  </dd>
                </div>
                <div>
                  <dt class="text-[10px] font-mono uppercase tracking-[0.22em] opacity-50">Availability</dt>
                  <dd class="mt-1 font-semibold">{o.availability}</dd>
                </div>
              </dl>
            </div>

            <div class="mt-10 flex flex-wrap gap-3">
              <a
                href="/contact"
                class="pill inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-[13px] font-semibold hover:bg-accent hover:text-accent-foreground"
              >
                Claim this offer →
              </a>
              <a
                href="/services/{o.id}"
                class="pill inline-flex items-center gap-2 border border-current px-6 py-3 text-[13px] opacity-70 hover:opacity-100"
              >
                Full details
              </a>
            </div>
          </div>
        </article>
      </Reveal>
    {/each}

    {#if offers.length === 0}
      <div class="py-32 text-center text-muted-foreground">
        <p class="text-[11px] font-mono uppercase tracking-[0.3em] text-accent">No offers right now</p>
        <p class="mt-4 text-lg">Check back soon — offers rotate with availability.</p>
        <a href="/services" class="mt-8 inline-flex pill bg-accent text-accent-foreground px-6 py-3 text-sm font-medium">
          Browse the full catalogue
        </a>
      </div>
    {/if}
  </section>

  <!-- Bottom CTA -->
  <section class="bg-card border-t border-border">
    <div class="mx-auto max-w-[900px] px-6 py-20 text-center">
      <Reveal>
        <p class="text-[13px] font-medium text-accent">Not sure which offer fits?</p>
        <h2 class="mt-4 text-4xl md:text-5xl">Ask the survey desk.</h2>
        <p class="mt-4 text-muted-foreground max-w-md mx-auto">
          Our AI concierge will match your site brief to the right survey —
          and flag any applicable offer automatically.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/chat" class="pill bg-accent text-accent-foreground px-7 py-3 text-[15px] font-medium">
            Ask an engineer ›
          </a>
          <a href="/services" class="pill border border-border px-7 py-3 text-[15px] hover:border-foreground/40">
            Browse catalogue
          </a>
        </div>
      </Reveal>
    </div>
  </section>

</div>
