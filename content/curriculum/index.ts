import type { Lesson, PhaseMeta } from "@/lib/curriculum/types";
import { representationLesson } from "./computing-foundations/representation";
import { processesLesson } from "./linux-os/processes";
import { vllmLesson } from "./model-serving/vllm";
import { dnsLesson } from "./networking/dns";
import { workloadsLesson } from "./kubernetes/workloads";
import { PHASES } from "./phases";

export const LESSONS: Lesson[] = [
  representationLesson,
  processesLesson,
  dnsLesson,
  workloadsLesson,
  vllmLesson,
];

export function getPhase(slug: string): PhaseMeta | undefined {
  return PHASES.find((p) => p.slug === slug);
}

export function getLesson(phaseSlug: string, lessonSlug: string): Lesson | undefined {
  return LESSONS.find((l) => l.phaseSlug === phaseSlug && l.slug === lessonSlug);
}

export function lessonsForPhase(phaseSlug: string): Lesson[] {
  return LESSONS.filter((l) => l.phaseSlug === phaseSlug).sort((a, b) => a.order - b.order);
}

export function authoredLessonCount(phase: PhaseMeta): number {
  return phase.modules.reduce((n, m) => n + m.lessonSlugs.length, 0);
}

export { PHASES };
