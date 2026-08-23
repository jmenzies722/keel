export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type SkillDimension =
  | "conceptual"
  | "implementation"
  | "debugging"
  | "operational"
  | "architecture"
  | "security"
  | "reliability";

export type EvidenceSource =
  | "quiz"
  | "exercise"
  | "lab"
  | "project"
  | "incident"
  | "architecture"
  | "interview";

export interface Skill {
  id: string;
  title: string;
  category: string;
  summary: string;
  /** Skill IDs that should precede this one. */
  prerequisites: string[];
}

export interface Evidence {
  id: string;
  skillId: string;
  source: EvidenceSource;
  dimension: SkillDimension;
  /** 0..1 quality of the demonstration */
  score: number;
  /** Relative importance; hint-heavy work should pass a lower weight */
  weight: number;
  at: string;
  artifactId: string;
  note?: string;
}

export interface DimensionScore {
  dimension: SkillDimension;
  score: number;
  evidenceCount: number;
}

export interface SkillProgress {
  skillId: string;
  level: SkillLevel;
  overall: number;
  dimensions: DimensionScore[];
  lastEvidenceAt?: string;
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  0: "Unknown",
  1: "Recognize",
  2: "Explain",
  3: "Apply",
  4: "Debug",
  5: "Design",
  6: "Operate independently",
  7: "Teach / lead",
};

export const DIMENSION_LABELS: Record<SkillDimension, string> = {
  conceptual: "Conceptual",
  implementation: "Commands / implementation",
  debugging: "Troubleshooting",
  operational: "Operations",
  architecture: "Architecture",
  security: "Security judgment",
  reliability: "Reliability judgment",
};
