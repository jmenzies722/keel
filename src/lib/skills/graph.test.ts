import { describe, expect, it } from "vitest";
import { SKILLS } from "@content/skills/catalog";
import type { Evidence } from "./types";
import { missingPrerequisites, recommendNext, scoreSkill, buildProgressMap } from "./graph";

function ev(partial: Partial<Evidence> & Pick<Evidence, "skillId" | "dimension" | "score">): Evidence {
  return {
    id: Math.random().toString(36).slice(2),
    source: "quiz",
    weight: 1,
    at: new Date().toISOString(),
    artifactId: "t",
    ...partial,
  };
}

describe("skill graph", () => {
  it("every prerequisite exists", () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    for (const skill of SKILLS) {
      for (const pre of skill.prerequisites) {
        expect(ids.has(pre)).toBe(true);
      }
    }
  });

  it("does not raise operate-independently from a single quiz", () => {
    const progress = scoreSkill("linux.processes", [
      ev({ skillId: "linux.processes", dimension: "conceptual", score: 1 }),
    ]);
    expect(progress.level).toBeLessThan(6);
    expect(progress.dimensions.find((d) => d.dimension === "conceptual")?.score).toBe(1);
    expect(progress.dimensions.find((d) => d.dimension === "debugging")?.score).toBe(0);
  });

  it("flags missing prerequisites below explain", () => {
    const map = buildProgressMap([]);
    expect(missingPrerequisites("containers.isolation", map)).toContain("linux.kernel");
  });

  it("walks the authored spine: lesson then matching incident", () => {
    const empty = buildProgressMap([]);
    expect(recommendNext({ progress: empty, completedLessons: [], resolvedIncidents: [] }).href).toBe(
      "/learn/computing-foundations/representation",
    );
    expect(
      recommendNext({
        progress: empty,
        completedLessons: ["computing-foundations/representation"],
        resolvedIncidents: [],
      }).href,
    ).toBe("/learn/linux-os/processes");
    expect(
      recommendNext({
        progress: empty,
        completedLessons: ["computing-foundations/representation", "linux-os/processes"],
        resolvedIncidents: [],
      }).href,
    ).toBe("/company/incidents/checkout-api-crash");
    expect(
      recommendNext({
        progress: empty,
        completedLessons: ["computing-foundations/representation", "linux-os/processes"],
        resolvedIncidents: ["checkout-api-crash"],
      }).href,
    ).toBe("/learn/networking/dns");
  });
});
