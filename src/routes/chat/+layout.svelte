<script lang="ts">
  import ThreadList from '$lib/components/chat/ThreadList.svelte';
  let { children } = $props();
</script>

<svelte:head>
  <title>Survey Desk AI — Rockwell Site Surveys</title>
  <meta name="description" content="Chat with Rockwell's on-call survey desk. Ask about structural, geotechnical, drone and geophysical surveys across Ireland." />
</svelte:head>

<div class="h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden">
  <div class="hidden md:flex h-full overflow-hidden">
    <ThreadList />
  </div>
  <div class="flex flex-col h-full overflow-hidden">
    {@render children()}
  </div>
</div>
