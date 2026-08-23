# Content authoring

## Add a lesson

1. Create `content/curriculum/<phase-slug>/<lesson-slug>.ts`.
2. Export a value that satisfies `LessonSchema`.
3. Register it in `content/curriculum/index.ts`.
4. Attach skill IDs that already exist in `content/skills/catalog.ts`.
5. Include canonical `references`.
6. Add a related company mission id when one exists.

## Add an incident

1. Create `content/incidents/<id>.ts` satisfying `IncidentScenarioSchema`.
2. Implement command handlers in the shared terminal catalog or a mission-specific adapter.
3. List discoveries the engine can unlock.
4. Define remediation that mutates state — not a “mark complete” button.
5. Write a debrief that teaches the investigation method.

## Voice

Write as a staff engineer mentoring a sharp junior.

- Precise vocabulary.
- No gamified exclamation.
- Show the production failure mode next to the happy path.
- Prefer one worked example over a list of facts.
