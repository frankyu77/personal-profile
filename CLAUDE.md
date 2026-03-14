# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

No test suite is configured.

## Architecture

This is a Next.js portfolio site built around an interactive 3D neural network visualization. The core experience is a physics-simulated node graph rendered with Three.js/React Three Fiber, where clicking nodes reveals content panels.

### Key Data Flow

1. `app/page.tsx` — Client-side root; manages `activeNode` state and keyboard (ESC) handling
2. `components/scene.tsx` — Dynamically imported (no SSR) React Three Fiber canvas wrapper
3. `components/neural-network.tsx` — The main 3D scene: 160+ ambient physics nodes + 5 named section nodes (About, Skills, Experience, Projects, Contact). Handles click → `onNodeClick` callback up to the page.
4. `components/content-panel.tsx` — Overlay panel that renders section content when a node is selected; has its own mini canvas-based plexus animation as background.

### Tech Stack Notes

- **Next.js App Router** with TypeScript; path alias `@/*` maps to project root
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin (not the classic `tailwind.config.js` approach)
- **OKLch color system** — all theme colors defined as CSS custom properties in `app/globals.css` using `oklch()` values
- **shadcn/ui** components live in `components/ui/` (style: "new-york"); add new ones via `pnpm dlx shadcn@latest add <component>`
- **`next.config.mjs`** has `typescript.ignoreBuildErrors: true` and `images.unoptimized: true`
