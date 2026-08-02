<script lang="ts">
  import { onMount } from 'svelte';
  import ChatWindow from '$lib/components/chat/ChatWindow.svelte';

  let { data } = $props();

  onMount(() => {
    if (data.initialMessage) {
      // Clean the ?q= param from the URL bar so a hard refresh doesn't re-send the message.
      // Use history.replaceState directly so SvelteKit's router doesn't re-run the loader
      // (which would strip the survey/region context and default weather back to Dublin).
      history.replaceState(null, '', `/chat/${data.threadId}`);
    }
  });
</script>

{#key data.threadId}
  <ChatWindow
    threadId={data.threadId}
    initialMessage={data.initialMessage}
    surveyId={data.surveyId}
    surveyName={data.surveyName}
    surveyRegion={data.surveyRegion}
  />
{/key}
