<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';

  let sent = $state(false);

  function handleSubmit(e: Event) {
    e.preventDefault();
    sent = true;
  }

  const surveyTypes = [
    'Not sure yet',
    'Structural Surveys',
    'Structural Inspections',
    'Geotechnical',
    'Drone Surveys',
    'Vibration Monitoring',
    'Geophysical Surveys',
    'Measured Surveys',
    'Environmental',
  ];

  const promises = [
    'Fixed fee. No hidden surcharges.',
    'Signed PDF report by a chartered engineer.',
    'Same-day response for emergency callouts.',
    '€13m professional indemnity cover.',
  ];
</script>

<svelte:head>
  <title>Contact — Rockwell Site Surveys</title>
  <meta name="description" content="Send a site brief to Rockwell and receive a fixed quote within one working day. Emergency structural callouts covered." />
</svelte:head>

<div>
  <PageHeader
    num="04"
    eyebrow="Request a survey"
    lede="We reply within one working day, Monday to Friday. For emergency structural callouts, ring the site number below any time."
  >
    {#snippet title()}
      Tell us the<br /><em class="not-italic text-accent">site.</em>
    {/snippet}
    {#snippet meta()}
      <dl class="grid grid-cols-2 gap-6 text-left md:text-right">
        <div>
          <dt class="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Studio</dt>
          <dd class="mt-1.5 font-serif text-lg leading-snug">14 Merrion Sq. N, Dublin D02</dd>
        </div>
        <div>
          <dt class="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Emergency</dt>
          <dd class="mt-1.5 font-serif text-lg leading-snug">+353 1 555 0198</dd>
        </div>
        <div>
          <dt class="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">General</dt>
          <dd class="mt-1.5 font-serif text-lg leading-snug">surveys@rockwell.ie</dd>
        </div>
        <div>
          <dt class="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Hours</dt>
          <dd class="mt-1.5 font-serif text-lg leading-snug">Mon–Fri · 08:00–18:00</dd>
        </div>
      </dl>
    {/snippet}
  </PageHeader>

  <section class="mx-auto max-w-[1400px] px-6 py-14 md:py-20 grid grid-cols-12 gap-10">
    <div class="col-span-12 md:col-span-5">
      <p class="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
        <span class="text-accent">§</span> Why brief us
      </p>
      <h2 class="mt-6 font-serif text-4xl md:text-5xl leading-[1.05]">
        Written by an engineer.<br />
        <em class="not-italic text-accent">Not a bot.</em>
      </h2>
      <p class="mt-6 text-muted-foreground leading-relaxed">
        Your brief is read by a chartered engineer. You'll get a real reply — not a form
        auto-response — with a fixed fee, a real name, and a real slot.
      </p>
      <ul class="mt-10 space-y-4 text-sm">
        {#each promises as t}
          <li class="flex items-start gap-3">
            <span class="text-accent mt-1">✦</span>
            <span>{t}</span>
          </li>
        {/each}
      </ul>
    </div>

    <form
      class="col-span-12 md:col-span-7 bg-card border border-border rounded-md p-6 md:p-10 self-start grain"
      onsubmit={handleSubmit}
    >
      {#if sent}
        <div class="py-10 text-center fade-in">
          <p class="text-[11px] font-mono uppercase tracking-[0.3em] text-accent">Received</p>
          <h3 class="mt-4 font-serif text-4xl">Brief filed.</h3>
          <p class="mt-4 text-muted-foreground">
            A chartered engineer will reply within one working day.
          </p>
        </div>
      {:else}
        <h3 class="font-serif text-3xl">Site brief</h3>
        <p class="mt-2 text-sm text-muted-foreground">Takes 60 seconds. Fixed quote within one working day.</p>
        <div class="mt-8 grid gap-5 md:grid-cols-2">
          <label class="grid gap-2 text-sm">
            <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Your name</span>
            <input required name="name" type="text" class="border border-border rounded-sm bg-background px-3 py-2.5 focus:outline-none focus:border-accent" />
          </label>
          <label class="grid gap-2 text-sm">
            <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Email</span>
            <input required name="email" type="email" class="border border-border rounded-sm bg-background px-3 py-2.5 focus:outline-none focus:border-accent" />
          </label>
          <label class="grid gap-2 text-sm md:col-span-2">
            <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Site address or Eircode</span>
            <input required name="site" type="text" class="border border-border rounded-sm bg-background px-3 py-2.5 focus:outline-none focus:border-accent" />
          </label>
          <label class="grid gap-2 text-sm">
            <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Phone (optional)</span>
            <input name="phone" type="text" class="border border-border rounded-sm bg-background px-3 py-2.5 focus:outline-none focus:border-accent" />
          </label>
          <label class="grid gap-2 text-sm">
            <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Survey type</span>
            <select name="survey" class="border border-border rounded-sm bg-background px-3 py-2.5 focus:outline-none focus:border-accent">
              {#each surveyTypes as type}
                <option>{type}</option>
              {/each}
            </select>
          </label>
          <label class="md:col-span-2 grid gap-2 text-sm">
            <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">What do you need?</span>
            <textarea
              required
              rows={5}
              class="border border-border rounded-sm bg-background px-3 py-2.5 focus:outline-none focus:border-accent"
              placeholder="e.g. Pre-purchase inspection for a semi-D in Rathmines, closing in 3 weeks."
            ></textarea>
          </label>
        </div>
        <button
          type="submit"
          class="mt-8 w-full md:w-auto inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium hover:bg-accent hover:text-accent-foreground transition active:scale-[0.97]"
        >
          Send brief <span aria-hidden="true">→</span>
        </button>
      {/if}
    </form>
  </section>
</div>
