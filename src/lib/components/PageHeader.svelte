<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    num,
    eyebrow,
    title,
    lede,
    meta,
  }: {
    num: string;
    eyebrow: string;
    title: Snippet;
    lede?: string;
    meta?: Snippet;
  } = $props();
</script>

<section class="bg-card border-b border-border">
  <div class="mx-auto max-w-[900px] px-6 pt-20 md:pt-28 pb-16 md:pb-20 text-center">
    <p class="rise text-[12px] font-medium tracking-[0.02em] text-accent">
      {eyebrow}
      <span class="sr-only"> — section {num}</span>
    </p>
    <h1 class="rise [animation-delay:80ms] mt-4 text-5xl md:text-7xl">
      {@render title()}
    </h1>
    {#if lede}
      <p class="fade-in [animation-delay:220ms] mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
        {lede}
      </p>
    {/if}
    {#if meta}
      <div class="fade-in [animation-delay:340ms] mt-10 flex flex-wrap justify-center gap-x-10 gap-y-6">
        {@render meta()}
      </div>
    {/if}
  </div>
</section>
