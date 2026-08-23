# Architecture

Product name: **Keel** (`src/lib/brand.ts`). Company: **Northstar Systems**.

## Audit (current stack)

| Concern | Decision |
|---|---|
| Framework | Next.js 16 App Router (`src/app`) |
| Language | TypeScript, strict |
| Package manager | npm |
| Styling | Tailwind CSS v4 + CSS variables |
| Components | shadcn/ui (Base UI / `base-nova`) |
| Motion | Framer Motion — used only for educational state changes |
| Code editor | Monaco (`@monaco-editor/react`) — reserved for later coding labs |
| State | Zustand + `localStorage` persist |
| Validation | Zod |
| Auth | Not in MVP. Profile is local. Interfaces leave room for Auth.js/Clerk. |
| Database | Not in MVP. Progress is local-first. Schema is designed so Prisma/Drizzle can replace the store later. |
| Tests | Vitest for domain logic |

The early 12-phase catalog in `src/lib/curriculum/phases.ts` is replaced by the 42-phase data-driven catalog. The typed block/lesson idea is preserved and expanded.

## Two experiences, one competency graph

```
Dashboard
   ├── Learn        structured curriculum
   └── Company      Northstar Systems simulator
              \         /
               Skill graph + evidence
```

Completion is demonstrated competence, not page views.

## Layering

```
content/          typed scenario + lesson data
src/lib/          brand, loaders, skill graph, progress, engines
src/components/   shell, lesson player, company console, visualizations
src/app/          routes only
```

UI components do not contain incident or lesson logic.

## Runtime abstractions

| Interface | MVP implementation | Later |
|---|---|---|
| `TerminalRuntime` | `SimulationTerminalRuntime` | sandboxed host / cloud lab |
| `ObservabilityProvider` | simulated metrics/logs/traces | real OTel backend |
| `KubernetesEnvironment` | simulated cluster snapshots | kind / remote sandbox |
| `CloudEnvironment` | simulated AWS resources | ephemeral AWS account |
| `InferenceEnvironment` | simulated vLLM / GPU / queue | GPU sandbox |
| `MentorProvider` | rule + policy engine | any LLM vendor |

No real shell, AWS, or GPU is required to use the product.

## Persistence

`src/lib/progress/store.ts` is the single write path for:

- lesson section completion
- quiz / lab / incident attempts
- skill evidence
- hint usage
- recommended-next inputs

When a backend is added, this store becomes a sync adapter.

## Routes

| Path | Experience |
|---|---|
| `/` | Dashboard |
| `/roadmap` | 42-phase competency map |
| `/learn/[phase]/[lesson]` | Lesson player |
| `/company` | Northstar console |
| `/company/incidents/[id]` | Incident workspace |
| `/skills` | Skill graph |
| `/labs` | Lab index |
| `/projects` | Project index |
| `/interview` | Interview mode (scaffold) |

## MVP vertical slice

1. Full 42-phase roadmap (catalog depth).
2. Linux Processes lesson — visualization, terminal, quiz, lab, evidence.
3. Company Simulator — crashing `checkout-api` incident + debrief.
4. Shared Linux skill evidence across both modes.
5. Advanced preview: AI inference latency incident.
