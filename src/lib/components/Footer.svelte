<script lang="ts">
  import Logo from '$lib/assets/logo.svg?raw';
</script>

<footer class="mt-24 bg-card border-t border-border">
  <div class="mx-auto max-w-[1024px] px-6 py-14 grid gap-10 md:grid-cols-4 text-[13px]">
    <div class="md:col-span-2">
      <span class="text-accent h-10 w-10 block">{@html Logo}</span>
      <p class="mt-4 text-[22px] font-semibold tracking-tight leading-snug">
        Ground truth, measured.
      </p>
      <p class="mt-3 max-w-xs text-muted-foreground leading-relaxed">
        Chartered structural &amp; geotechnical surveys across fifteen Irish
        counties. Signed reports, fixed fees, honest lead times.
      </p>
    </div>
    <nav class="grid gap-2.5 content-start">
      <p class="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Explore</p>
      <a href="/services" class="text-muted-foreground hover:text-accent transition-colors w-fit">Surveys</a>
      <a href="/regions" class="text-muted-foreground hover:text-accent transition-colors w-fit">Coverage</a>
      <a href="/process" class="text-muted-foreground hover:text-accent transition-colors w-fit">Process</a>
      <a href="/chat" class="text-muted-foreground hover:text-accent transition-colors w-fit">Ask AI</a>
    </nav>
    <div class="grid gap-2.5 content-start">
      <p class="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Studio</p>
      <p class="text-muted-foreground leading-relaxed">
        14 Merrion Sq. N,<br />Dublin D02 XR20
      </p>
      <p class="text-muted-foreground">surveys@rockwell.ie</p>
      <p class="text-muted-foreground">+353 1 555 0198</p>
    </div>
  </div>
  <div class="border-t border-border">
    <div class="mx-auto max-w-[1024px] px-6 py-5 flex flex-col md:flex-row justify-between gap-2 text-[11px] text-muted-foreground">
      <p>© {new Date().getFullYear()} Rockwell Site Surveys Ltd. · CRO 284119</p>
      <p>Chartered Engineers Ireland · Insured to €13m</p>
    </div>
  </div>
</footer>
