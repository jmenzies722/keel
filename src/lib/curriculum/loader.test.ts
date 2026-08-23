import { describe, expect, it } from "vitest";
import { getLesson, LESSONS, PHASES } from "@content/curriculum/index";
import { LessonIdentitySchema } from "./schema";

describe("curriculum loader", () => {
  it("catalogs 42 phases", () => {
    expect(PHASES).toHaveLength(42);
    expect(new Set(PHASES.map((p) => p.slug)).size).toBe(42);
    expect(PHASES.map((p) => p.order)).toEqual([...Array(42)].map((_, i) => i + 1));
  });

  it("marks linux-os as the authored available phase", () => {
    const linux = PHASES.find((p) => p.slug === "linux-os");
    expect(linux?.status).toBe("available");
    expect(linux?.modules.some((m) => m.lessonSlugs.includes("processes"))).toBe(true);
  });

  it("loads the Linux Processes lesson with the required contract", () => {
    const lesson = getLesson("linux-os", "processes");
    expect(lesson).toBeDefined();
    const parsed = LessonIdentitySchema.parse(lesson);
    expect(parsed.objectives.length).toBeGreaterThanOrEqual(4);
    const kinds = new Set(lesson!.sections.map((s) => s.kind as string));
    for (const required of ["objective", "mental-model", "visualization", "knowledge-check", "lab", "related-mission", "references"]) {
      expect(kinds.has(required)).toBe(true);
    }
  });

  it("authors the five-lesson spine", () => {
    expect(LESSONS.map((l) => l.id).sort()).toEqual(
      [
        "computing-foundations/representation",
        "kubernetes/workloads",
        "linux-os/processes",
        "model-serving/vllm",
        "networking/dns",
      ].sort(),
    );
  });
});
