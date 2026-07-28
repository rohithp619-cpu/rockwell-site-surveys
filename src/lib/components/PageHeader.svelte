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

<section class="border-b border-border">
  <div class="mx-auto max-w-[1400px] px-6 pt-16 md:pt-28 pb-14 md:pb-20 grid grid-cols-12 gap-6 items-end">
    <div class="col-span-12 md:col-span-8 rise">
      <div class="flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
        <span class="text-accent">§ {num}</span>
        <span class="h-px w-8 bg-foreground/30"></span>
        <span>{eyebrow}</span>
      </div>
      <h1 class="mt-8 font-serif text-6xl md:text-8xl lg:text-[9rem] leading-[0.92]">
        {@render title()}
      </h1>
      {#if lede}
        <p class="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
          {lede}
        </p>
      {/if}
    </div>
    {#if meta}
      <div class="col-span-12 md:col-span-4 md:text-right fade-in [animation-delay:200ms]">
        {@render meta()}
      </div>
    {/if}
  </div>
</section>
