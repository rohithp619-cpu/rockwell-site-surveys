# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server at http://localhost:5173
npm run build      # production build
npm run preview    # preview production build (port 4173)
npm run check      # svelte-check type-check
```

No test suite — verify changes visually via the dev server.

## Stack

SvelteKit + Svelte 5 (runes mode) · Tailwind v4 · TypeScript · no backend

- **Svelte 5 runes** are used throughout: `$props()`, `$state()`, `$derived()`, `{@render snippet()}` — not the Svelte 4 slot/export API.
- **Tailwind v4** config lives entirely in `src/app.css` via `@theme inline {}` — there is no `tailwind.config.js`.
- `adapter-auto` is used; no deployment target is configured yet.

## Architecture

### Data layer — `src/lib/services.ts`
Single source of truth for all 30 services (RS001–RS030). Exports:
- `services: Service[]` — full catalogue
- `categories`, `regions` — derived unique lists for filters
- `formatEur(n)` — locale-aware EUR formatter (en-IE)
- `imageFor(s)` — maps a service to its Unsplash cover (category fallback + per-id overrides)
- `getService(id)` — case-insensitive lookup used by the dynamic route loader

### Routing
| Route | Notes |
|---|---|
| `/` | Homepage with hero, marquee, featured grid (RS001, RS009, RS016, RS021), manifesto |
| `/services` | Full catalogue with filter/sort UI |
| `/services/[id]` | Detail page; `+page.ts` calls `getService()` and throws 404 if not found |
| `/regions` | Coverage map |
| `/process` | Four-step workflow |
| `/contact` | Enquiry form |

`+error.svelte` handles 404 and generic errors globally.

### Layout
`+layout.svelte` wraps every page: `Nav → <main> → Footer`. The shell uses `min-h-screen flex flex-col` so the footer is always pushed to the bottom.

### Design tokens (defined in `src/app.css`)
| Token | Value |
|---|---|
| `--bone` | Background (warm off-white) |
| `--ink` | Foreground (near-black) |
| `--ochre` | Accent colour — used for `§` section markers, price badges, hover states |
| `--moss`, `--rust` | Supporting palette (sparingly used) |
| `--font-serif` | Instrument Serif — headings and display text |
| `--font-mono` | JetBrains Mono — metadata labels, section numbers, codes |

Custom utilities defined in `app.css`: `rise` (blur + slide-up entrance), `fade-in` (opacity + slide-up), `card-hover` (lift on hover), `grain` (SVG noise overlay), `marquee-track` (infinite scroll).

### PageHeader component
Shared editorial header used by interior pages. Props: `num` (section code, e.g. `"§ 01"`), `eyebrow` (label), `title` (Snippet), optional `lede` and `meta` (Snippet). The `title` and `meta` props are Svelte 5 snippets — pass them with `{#snippet title()}…{/snippet}` syntax.

### Section numbering convention
Pages use `§ NN` section markers in `font-mono uppercase tracking-[0.3em]` with `text-accent` on the symbol. Interior sections continue numbering sequentially within the page.

### Grid system
12-column grid with `max-w-[1400px] px-6 mx-auto` wrapper on every section. Breakpoints follow Tailwind defaults; most layouts shift from single-column to multi-column at `md:`.
