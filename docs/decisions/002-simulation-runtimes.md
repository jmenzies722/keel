# ADR 002 — Simulation runtimes over host execution

## Status

Accepted for MVP.

## Context

Learners need realistic `ps`, `systemctl`, `journalctl`, `kubectl`, and inference metrics. Executing a real shell on the Cloud Agent or a learner laptop is unsafe and non-deterministic.

## Decision

Define `TerminalRuntime` and sibling environment interfaces. Ship `SimulationTerminalRuntime` with mission-scoped process tables, unit files, and log streams. Do not wrap xterm.js until a sandbox backend exists — a semantic, accessible React terminal is easier to test and to map onto discoveries.

## Consequences

- Commands are deterministic and unit-testable.
- Dangerous commands cannot escape.
- Later sandboxes implement the same interface.
