# Keel

**Engineering Learning OS**

Study the path from computing foundations to staff-level AI platform engineering, then prove the same skills inside a simulated company (Northstar Systems).

Keel is not a course catalog with a progress bar. Completion means demonstrated competence.

## Two experiences

| | Learn | Company |
|---|---|---|
| Purpose | Structured curriculum | Operate Northstar Systems |
| Route | `/learn` | `/company` |
| Evidence | Quiz, terminal, lab, project | Incidents, diagnosis, debrief |

Both write to **one skill graph**. Opening a page moves nothing.

## Authored spine (end to end)

1. Data representation → binary explorer + conversion project  
2. Linux processes → SEV-2 checkout-api restart loop  
3. DNS → SEV-2 hosts-file cutover  
4. Kubernetes workloads → SEV-2 CrashLoopBackOff (missing secret)  
5. vLLM / KV cache → SEV-2 inference p95 (advanced)

The other 37 phases are real catalog nodes on `/roadmap`, not fake completed courses.

## Repository and pipeline

- GitHub: https://github.com/jmenzies722/keel
- Production: Vercel (created from this repo). Preview deployments follow every non-`main` branch once the project is linked.

### What CI does

On every push and pull request, `.github/workflows/ci.yml` runs:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`

Production deploys (`.github/workflows/deploy.yml`) run **only after verify passes on `main`**, using a prebuilt Vercel artifact (`vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`).

Required GitHub Actions secrets (repository or `production` environment):

| Secret | Purpose |
|---|---|
| `VERCEL_TOKEN` | Vercel CLI auth |
| `VERCEL_ORG_ID` | From `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` after `vercel link` |

Alternatively, import the repo at [vercel.com/new](https://vercel.com/new) and let Vercel’s Git integration deploy `main` to production and PRs to preview URLs. The Actions quality gate still runs.

## Setup

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Suggested path: Home → Learn → each lesson’s mission at Company → Interview → Portfolio.

## Stack

Next.js 16 App Router · TypeScript · Tailwind v4 · shadcn/ui · Zustand (local) · Zod · Monaco · Vitest

No database, AWS account, or GPU required. Terminals are simulated. See `docs/`.

Names live in `src/lib/brand.ts` (product) and `content/company/northstar.ts` (company).
