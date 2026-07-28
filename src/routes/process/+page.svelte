<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';

  const steps = [
    {
      n: '01',
      t: 'Brief',
      d: 'Send drawings, a site address, or a photo. We reply within one working day with a fixed fee and a slot.',
      detail: "Every enquiry is triaged by a chartered engineer, not a sales team. If the survey you ask for isn't the right one, we say so and propose an alternative — sometimes at a lower fee.",
      kpi: '< 1 day reply',
    },
    {
      n: '02',
      t: 'Site day',
      d: 'A chartered engineer attends on the agreed date with calibrated instruments and captures every measurement the report needs.',
      detail: 'We rotate three field crews out of Dublin, Cork Harbour and Galway. Instruments are calibrated quarterly and every job carries a digital record of the equipment used.',
      kpi: 'Full day on-site',
    },
    {
      n: '03',
      t: 'Signed report',
      d: 'You receive a signed PDF report — planner-ready, insurer-ready — usually within the quoted duration.',
      detail: 'Reports are written to be read by architects, solicitors, planners and insurers. Every finding is qualified. Every photograph is captioned. Every conclusion carries a name.',
      kpi: 'PDF · signed',
    },
    {
      n: '04',
      t: 'Follow-up',
      d: 'Questions from your architect, planner or solicitor are answered by the same engineer who did the survey.',
      detail: 'No handovers. No account managers. Follow-up correspondence is included in the fee for six months from report date.',
      kpi: '6 months included',
    },
  ];
</script>

<svelte:head>
  <title>Process — Rockwell Site Surveys</title>
  <meta name="description" content="Rockwell's four-step engineering survey workflow: brief, site day, signed report and follow-up. Fixed fees, honest lead times." />
</svelte:head>

<div>
  <PageHeader
    num="03"
    eyebrow="How it works"
    lede="No unnecessary meetings. No mystery fees. Every stage below is included in the fixed quote you receive after the first reply."
  >
    {#snippet title()}
      A short<br /><em class="not-italic text-accent">honest</em> workflow.
    {/snippet}
  </PageHeader>

  <section class="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
    <ol class="grid gap-px bg-border rounded-md overflow-hidden border border-border">
      {#each steps as s, i}
        <li
          class="bg-background p-6 md:p-10 grid md:grid-cols-12 gap-6 md:gap-10 items-start rise"
          style="animation-delay: {i * 80}ms"
        >
          <div class="md:col-span-2 flex md:block items-baseline gap-4">
            <span class="font-serif text-6xl md:text-8xl leading-none text-accent">{s.n}</span>
            <span class="md:mt-3 block text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              {s.kpi}
            </span>
          </div>
          <div class="md:col-span-4">
            <h2 class="font-serif text-4xl md:text-5xl leading-none">{s.t}</h2>
            <p class="mt-4 font-serif text-xl text-foreground/80 leading-snug">{s.d}</p>
          </div>
          <p class="md:col-span-6 text-muted-foreground leading-relaxed md:pl-8 md:border-l md:border-border">
            {s.detail}
          </p>
        </li>
      {/each}
    </ol>

    <div class="mt-16 grid md:grid-cols-2 gap-4">
      <a
        href="/services"
        class="card-hover bg-card border border-border p-8 rounded-md flex items-center justify-between group"
      >
        <span class="font-serif text-3xl">Pick a survey →</span>
        <span class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-accent">01 / Catalogue</span>
      </a>
      <a
        href="/contact"
        class="card-hover bg-primary text-primary-foreground p-8 rounded-md flex items-center justify-between group"
      >
        <span class="font-serif text-3xl">Send a brief →</span>
        <span class="text-[10px] font-mono uppercase tracking-widest text-primary-foreground/60 group-hover:text-accent">04 / Contact</span>
      </a>
    </div>
  </section>
</div>
