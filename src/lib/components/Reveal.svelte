<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  let {
    children,
    delay = 0,
    class: className = '',
  }: {
    children: Snippet;
    delay?: number;
    class?: string;
  } = $props();

  let el: HTMLDivElement | undefined = $state();
  let shown = $state(false);

  onMount(() => {
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          shown = true;
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  });
</script>

<div
  bind:this={el}
  style="transition-delay: {delay}ms"
  class="reveal {shown ? 'reveal-in' : ''} {className}"
>
  {@render children()}
</div>
