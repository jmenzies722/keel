# Curriculum architecture

## Entities

```
Track → Phase → Module → Lesson
Lesson → Section → Block
Block  = text | callout | visualization | example | terminal | quiz | lab | project | references
Concept, Exercise, Lab, Project, Assessment, Mission, Incident
Skill ← Evidence (from any of the above)
```

Phases are catalog records. Only authored lessons ship full content. That is intentional: the product grows by adding content files, not React pages.

## Lesson contract

Every fully authored lesson includes:

1. Objective
2. Mental model
3. Interactive explanation
4. Visualization
5. Worked example
6. Guided exercise (terminal or editor)
7. Production relevance
8. Failure mode
9. Knowledge check
10. Lab
11. Related company mission
12. Canonical references

## Content location

```
content/
  curriculum/         lessons keyed by phase slug
  company/            organizations + stages
  incidents/          scenario definitions
  labs/               standalone labs
  skills/             competency catalog + edges
```

Content is TypeScript validated by Zod (`src/lib/curriculum/schema.ts`). MDX can be added later; the schema does not assume a file format.

## Authoring rules

- Teach from primary sources (man pages, Kubernetes docs, AWS docs, CNCF, NVIDIA, vLLM, KServe, OpenTelemetry).
- Attach `references[]` with title, URL, and kind (`standard` | `man` | `vendor` | `cncf`).
- Never update a skill because a section was opened. Emit `Evidence` only from scored work.
- Prefer one excellent lesson over twenty outlines.

See `docs/content-authoring.md`.
