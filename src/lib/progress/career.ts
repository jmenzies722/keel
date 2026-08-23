import type { SkillProgress } from "@/lib/skills/types";

export interface CareerBand {
  id: string;
  title: string;
  blurb: string;
}

const BANDS: CareerBand[] = [
  { id: "foundation", title: "Foundation", blurb: "Building the mental models under software." },
  { id: "junior-systems", title: "Junior Systems Engineer", blurb: "Can investigate a Linux host with a method." },
  { id: "cloud", title: "Cloud Engineer", blurb: "IAM, VPC, and delivery with a paper trail." },
  { id: "devops", title: "DevOps Engineer", blurb: "Pipelines, containers, and rollback." },
  { id: "sre", title: "SRE", blurb: "SLOs, incidents, and reliability judgment." },
  { id: "platform", title: "Platform Engineer", blurb: "Paved roads and self-service interfaces." },
  { id: "senior-platform", title: "Senior Platform Engineer", blurb: "Control planes and multi-tenancy." },
  { id: "ai-infra", title: "AI Infrastructure Engineer", blurb: "GPU fleets and model serving." },
  { id: "ai-platform", title: "AI Platform Engineer", blurb: "Gateway, registry, and developer path." },
  { id: "senior-ai", title: "Senior AI Platform Engineer", blurb: "Capacity, tenancy, and cost." },
  { id: "staff-ai", title: "Staff AI Platform Engineer", blurb: "Architecture and governance of the whole system." },
];

const THRESHOLDS: { id: string; skills: { id: string; min: number }[] }[] = [
  { id: "staff-ai", skills: [{ id: "ai.platform", min: 5 }] },
  { id: "senior-ai", skills: [{ id: "ai.finops", min: 4 }, { id: "ai.platform", min: 3 }] },
  { id: "ai-platform", skills: [{ id: "ai.gateway", min: 4 }, { id: "serve.vllm", min: 3 }] },
  { id: "ai-infra", skills: [{ id: "serve.vllm", min: 3 }, { id: "gpu.scheduling", min: 3 }] },
  { id: "senior-platform", skills: [{ id: "plat.control-planes", min: 4 }] },
  { id: "platform", skills: [{ id: "plat.foundations", min: 3 }] },
  { id: "sre", skills: [{ id: "sre.slo", min: 3 }] },
  { id: "devops", skills: [{ id: "containers.isolation", min: 3 }, { id: "devops.cicd", min: 3 }] },
  { id: "cloud", skills: [{ id: "aws.vpc", min: 3 }] },
  { id: "junior-systems", skills: [{ id: "linux.processes", min: 3 }] },
];

export function careerBand(progress: Record<string, SkillProgress>): CareerBand {
  for (const row of THRESHOLDS) {
    if (row.skills.every((s) => (progress[s.id]?.level ?? 0) >= s.min)) {
      return BANDS.find((b) => b.id === row.id) ?? BANDS[0];
    }
  }
  return BANDS[0];
}

export { BANDS as CAREER_BANDS };
