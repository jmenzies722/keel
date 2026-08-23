# ADR 003 — Typed TypeScript content + Zod

## Status

Accepted for MVP.

## Context

The curriculum must be data-driven. MDX is attractive for prose but weaker for incident state machines, command tables, and skill links.

## Decision

Author content as TypeScript modules validated by Zod. Lesson prose uses constrained markdown inside typed blocks. MDX can wrap the same schema later.

## Consequences

- Content is type-checked with the app.
- Incident logic stays out of React components.
- Authors need TypeScript, not a CMS.
