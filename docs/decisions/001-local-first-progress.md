# ADR 001 — Local-first progress

## Status

Accepted for MVP.

## Context

The product needs a complete Learn ↔ Company loop without introducing auth, Postgres, or paid infrastructure.

## Decision

Persist learner state in Zustand + `localStorage`. Keep the write API (`recordEvidence`, `recordAttempt`, …) independent of storage so a future Prisma/Drizzle + Auth.js adapter can replace the persist layer.

## Consequences

- The app runs with `npm run dev` and no secrets.
- Progress does not sync across devices.
- Schema evolution must remain backward-compatible or versioned (`progress.version`).
