# Skill model

Competence is a graph, not a progress bar.

## Level

| Level | Meaning |
|---|---|
| 0 | Unknown |
| 1 | Recognize |
| 2 | Explain |
| 3 | Apply |
| 4 | Debug |
| 5 | Design |
| 6 | Operate independently |
| 7 | Teach / lead |

Levels are computed from evidence weight, recency, and dimension coverage. Opening a page does nothing.

## Dimensions

- conceptual
- implementation
- debugging
- operational
- architecture
- security
- reliability

A Linux Processes lesson quiz raises *conceptual*. Resolving a production crash raises *debugging* and *operational*. The dashboard shows the split.

## Evidence

```
Evidence {
  skillId
  source        quiz | exercise | lab | project | incident | architecture | interview
  dimension
  score         0..1
  weight
  at
  artifactId?
}
```

Repeated successful performance raises confidence. Hint-heavy solves reduce weight.

## Prerequisites

Edges are explicit. Example:

```
linux.processes → containers.isolation → k8s.pods → k8s.scheduling → gpu.scheduling → ai.capacity
```

Recommendations walk the graph: close prerequisite gaps, then weak dimensions, then the next production mission.
