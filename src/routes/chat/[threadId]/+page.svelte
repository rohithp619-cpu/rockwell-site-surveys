<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import ChatWindow from '$lib/components/chat/ChatWindow.svelte';

  let { data } = $props();

  onMount(() => {
    if (data.initialMessage) {
      // Clear the q param so a refresh doesn't re-send the message
      goto(`/chat/${data.threadId}`, { replaceState: true, noScroll: true, keepFocus: true });
    }
  });
</script>

{#key data.threadId}
  <ChatWindow threadId={data.threadId} initialMessage={data.initialMessage} />
{/key}
