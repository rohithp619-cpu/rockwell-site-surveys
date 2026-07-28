<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import FloatingChat from '$lib/components/FloatingChat.svelte';

  let { children } = $props();

  const isChat = $derived($page.url.pathname.startsWith('/chat'));
</script>

<svelte:head>
  <title>Rockwell Site Surveys — Chartered Engineers, Ireland</title>
  <meta name="description" content="Structural, geotechnical, drone and geophysical surveys across Ireland. Signed reports, fixed fees, honest lead times." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="min-h-screen flex flex-col bg-background text-foreground">
  <Nav />
  <main class="flex-1 {isChat ? 'flex flex-col overflow-hidden' : ''}">
    {@render children()}
  </main>
  {#if !isChat}
    <Footer />
  {/if}
</div>
<FloatingChat />
