import { AUTHORED_PATH } from "@content/path";
import { SKILL_BY_ID, SKILLS } from "@content/skills/catalog";
import type { Evidence, SkillLevel, SkillProgress, DimensionScore, SkillDimension } from "./types";
import { DIMENSION_LABELS } from "./types";

const ALL_DIMENSIONS = Object.keys(DIMENSION_LABELS) as SkillDimension[];

export function getSkill(id: string) {
  return SKILL_BY_ID[id];
}

export function prerequisitesOf(id: string): string[] {
  return SKILL_BY_ID[id]?.prerequisites ?? [];
}

export function dependentsOf(id: string): string[] {
  return SKILLS.filter((s) => s.prerequisites.includes(id)).map((s) => s.id);
}

export function missingPrerequisites(id: string, progress: Record<string, SkillProgress>): string[] {
  return prerequisitesOf(id).filter((pre) => (progress[pre]?.level ?? 0) < 2);
}

export function scoreSkill(skillId: string, evidence: Evidence[]): SkillProgress {
  const relevant = evidence.filter((e) => e.skillId === skillId);
  const dimensions: DimensionScore[] = ALL_DIMENSIONS.map((dimension) => {
    const items = relevant.filter((e) => e.dimension === dimension);
    if (items.length === 0) {
      return { dimension, score: 0, evidenceCount: 0 };
    }
    const weight = items.reduce((s, e) => s + e.weight, 0);
    const total = items.reduce((s, e) => s + e.score * e.weight, 0);
    return { dimension, score: weight === 0 ? 0 : total / weight, evidenceCount: items.length };
  });

  const covered = dimensions.filter((d) => d.evidenceCount > 0);
  const overall =
    covered.length === 0
      ? 0
      : covered.reduce((s, d) => s + d.score, 0) / Math.max(3, covered.length);
  const breadth = covered.length / 4;
  const adjusted = overall * Math.min(1, 0.45 + breadth);

  return {
    skillId,
    level: overallToLevel(adjusted, covered.length),
    overall: adjusted,
    dimensions,
    lastEvidenceAt: relevant.at(-1)?.at,
  };
}

export function overallToLevel(overall: number, dimensionCount: number): SkillLevel {
  if (overall <= 0) return 0;
  if (overall < 0.2) return 1;
  if (overall < 0.35) return 2;
  if (overall < 0.5) return 3;
  if (overall < 0.65 || dimensionCount < 2) return 4;
  if (overall < 0.78 || dimensionCount < 3) return 5;
  if (overall < 0.9) return 6;
  return 7;
}

export function buildProgressMap(evidence: Evidence[]): Record<string, SkillProgress> {
  const map: Record<string, SkillProgress> = {};
  for (const skill of SKILLS) {
    map[skill.id] = scoreSkill(skill.id, evidence);
  }
  return map;
}

export interface Recommendation {
  kind: "lesson" | "incident" | "skill" | "portfolio";
  title: string;
  href: string;
  reason: string;
}

export function recommendNext(input: {
  progress: Record<string, SkillProgress>;
  completedLessons: string[];
  resolvedIncidents: string[];
  weakRecent?: string;
}): Recommendation {
  for (const node of AUTHORED_PATH) {
    if (!input.completedLessons.includes(node.lesson)) {
      return {
        kind: "lesson",
        title: node.title,
        href: `/learn/${node.lesson}`,
        reason: reasonForLesson(node.lesson),
      };
    }
    if (node.incident && !input.resolvedIncidents.includes(node.incident)) {
      return {
        kind: "incident",
        title: node.incidentTitle ?? node.incident,
        href: `/company/incidents/${node.incident}`,
        reason: reasonForIncident(node.incident, input),
      };
    }
  }

  return {
    kind: "portfolio",
    title: "Portfolio",
    href: "/portfolio",
    reason:
      "The authored spine is evidenced. Review what you actually completed — then use Interview to pressure-test the same skills.",
  };
}

function reasonForLesson(lesson: string): string {
  if (lesson === "computing-foundations/representation") {
    return "Start with how machines store numbers. Everything later — memory, packets, tokens — is this idea under load.";
  }
  if (lesson === "linux-os/processes") {
    return "The process model is the prerequisite for containers, Kubernetes, and every “the service is down” page.";
  }
  if (lesson === "networking/dns") {
    return "You can investigate a host. The next production class is name resolution — where the request dies before it reaches a process.";
  }
  if (lesson === "kubernetes/workloads") {
    return "DNS and processes are evidenced. Workloads are how those processes are declared and reconciled.";
  }
  if (lesson === "model-serving/vllm") {
    return "You have operated Linux and Kubernetes. Inference adds a memory-shaped SLO: the KV cache.";
  }
  return "Next authored lesson on the Keel spine.";
}

export function companyStageFromIncidents(resolved: string[]): {
  id: string;
  title: string;
  role: string;
} {
  if (resolved.includes("inference-kv-cache")) {
    return { id: "ai-company", title: "AI company", role: "AI Platform Engineer" };
  }
  if (resolved.includes("crashloop-backoff")) {
    return { id: "cloud-native", title: "Cloud-native", role: "Platform / SRE Engineer" };
  }
  if (resolved.includes("broken-dns")) {
    return { id: "saas", title: "Growing SaaS", role: "DevOps Engineer" };
  }
  return { id: "startup", title: "Startup", role: "Junior Engineer" };
}

function reasonForIncident(incident: string, input: { progress: Record<string, SkillProgress> }): string {
  if (incident === "checkout-api-crash") {
    const processes = input.progress["linux.processes"];
    const conceptual = processes?.dimensions.find((d) => d.dimension === "conceptual")?.score ?? 0;
    const debugging = processes?.dimensions.find((d) => d.dimension === "debugging")?.score ?? 0;
    if (conceptual > 0.6 && debugging < 0.5) {
      return "You can explain the process model, but you have not yet demonstrated troubleshooting on a failing systemd unit.";
    }
    return "Northstar’s checkout API is in a restart loop. Same skills, no narrator.";
  }
  if (incident === "broken-dns") {
    return "Customers cannot resolve checkout.northstar.internal. Prove the lookup path; do not restart the API.";
  }
  if (incident === "crashloop-backoff") {
    return "The unit is now a Deployment. CrashLoopBackOff is the Kubernetes spelling of a restart storm.";
  }
  if (incident === "inference-kv-cache") {
    return "Diagnose a production vLLM fleet without treating GPU utilization as the whole story.";
  }
  return "Operate the system you just studied.";
}
