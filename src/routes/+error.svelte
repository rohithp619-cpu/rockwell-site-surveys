<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>{$page.status} — Rockwell Site Surveys</title>
</svelte:head>

<div class="flex-1 flex items-center justify-center px-6 py-24">
  <div class="max-w-lg text-center">
    <p class="text-xs font-mono uppercase tracking-[0.3em] text-accent">Error {$page.status}</p>
    {#if $page.status === 404}
      <h1 class="mt-6 font-serif text-7xl md:text-8xl leading-none">Off-grid.</h1>
      <p class="mt-4 text-muted-foreground">
        That page isn't in the survey. Head back and pick a route.
      </p>
    {:else}
      <h1 class="mt-6 font-serif text-4xl">This page didn't load</h1>
      <p class="mt-4 text-muted-foreground">
        Something went wrong on our end. Try again, or head back to the index.
      </p>
    {/if}
    <a
      href="/"
      class="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      Return to base ↩
    </a>
  </div>
</div>
