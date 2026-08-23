export type IncidentSeverity = "SEV-1" | "SEV-2" | "SEV-3" | "SEV-4";

export type CompanyStageId =
  | "startup"
  | "saas"
  | "cloud-native"
  | "internal-platform"
  | "ai-company"
  | "ai-scale"
  | "agentic";

export interface CompanyStage {
  id: CompanyStageId;
  order: number;
  title: string;
  role: string;
  summary: string;
  infrastructure: string[];
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  about: string;
  stages: CompanyStage[];
  defaultStage: CompanyStageId;
}

export interface Signal {
  id: string;
  system: "metrics" | "logs" | "traces" | "status" | "deploy";
  title: string;
  body: string;
  misleading?: boolean;
}

export interface Discovery {
  id: string;
  label: string;
  detail: string;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  discoveries: string[];
  /** Mutate scenario flags (e.g. orphanKilled). */
  effects?: Record<string, boolean | string | number>;
}

export interface TerminalCommand {
  /** Matched after normalization. Supports prefix if `prefix` is true. */
  match: string;
  prefix?: boolean;
  run: (ctx: TerminalContext) => CommandResult;
}

export interface TerminalContext {
  raw: string;
  args: string[];
  state: Record<string, boolean | string | number>;
}

export interface TerminalRuntimeSpec {
  id: string;
  hostname: string;
  promptUser: string;
  cwd: string;
  motd?: string;
  commands: TerminalCommand[];
  fallback?: (ctx: TerminalContext) => CommandResult;
}

export interface RootCause {
  id: string;
  summary: string;
  detail: string;
}

export interface InvestigationStep {
  id: string;
  label: string;
  discoveryIds: string[];
}

export interface ResolutionSpec {
  requiredDiscoveries: string[];
  requiredState: Record<string, boolean | string | number>;
  successMessage: string;
}

export interface DebriefSpec {
  whatHappened: string;
  productionLesson: string;
  recommendedPath: string[];
  relatedLessonHref: string;
  relatedLessonTitle: string;
}

export interface IncidentScenario {
  id: string;
  title: string;
  severity: IncidentSeverity;
  companyStage: CompanyStageId;
  preview?: boolean;
  summary: string;
  impact: string;
  requiredSkills: string[];
  evidenceSkills: { skillId: string; dimension: import("@/lib/skills/types").SkillDimension }[];
  symptoms: Signal[];
  systems: ("terminal" | "logs" | "metrics" | "kubernetes" | "aws" | "inference")[];
  rootCause: RootCause;
  discoveries: Discovery[];
  validInvestigations: InvestigationStep[];
  resolution: ResolutionSpec;
  debrief: DebriefSpec;
  runtimeId: string;
  initialState?: Record<string, boolean | string | number>;
  /** Optional diagnosis choices for preview missions that cannot be "fixed" via one command. */
  diagnosisOptions?: { id: string; text: string; correct: boolean }[];
}

export interface IncidentAttempt {
  incidentId: string;
  commands: string[];
  discoveries: string[];
  hintsUsed: number;
  symptomRestarts: number;
  resolved: boolean;
  diagnosisId?: string;
  startedAt: string;
  resolvedAt?: string;
}
