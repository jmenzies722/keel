export type PhaseStatus = "available" | "preview" | "catalog";

export type TrackId = "foundations" | "production" | "platform" | "ai";

export interface PhaseMeta {
  id: string;
  slug: string;
  order: number;
  track: TrackId;
  title: string;
  tagline: string;
  description: string;
  status: PhaseStatus;
  estimatedHours: number;
  skills: string[];
  modules: ModuleMeta[];
}

export interface ModuleMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessonSlugs: string[];
}

export interface Reference {
  title: string;
  href?: string;
  kind: "standard" | "man" | "vendor" | "cncf" | "book";
  note?: string;
}

export interface TextBlock {
  kind: "text";
  md: string;
}

export interface CalloutBlock {
  kind: "callout";
  variant: "info" | "tip" | "warning" | "insight" | "failure";
  title: string;
  md: string;
}

export type VisualizationId =
  | "binary-explorer"
  | "process-lifecycle"
  | "dns-resolution"
  | "tcp-handshake"
  | "k8s-control-loop"
  | "inference-queue"
  | "kv-cache";

export interface VisualizationBlock {
  kind: "visualization";
  visualization: VisualizationId;
  caption?: string;
}

export interface ExampleBlock {
  kind: "example";
  title: string;
  md: string;
  code?: string;
  language?: "bash" | "python" | "go" | "yaml" | "text";
}

export interface TerminalBlock {
  kind: "terminal";
  runtimeId: string;
  title: string;
  brief: string;
  successDiscoveries: string[];
}

export interface QuizOption {
  id: string;
  text: string;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  code?: string;
  options: QuizOption[];
  correctOptionId: string;
}

export interface QuizBlock {
  kind: "quiz";
  id: string;
  title: string;
  questions: QuizQuestion[];
  skillIds: string[];
}

export interface LabBlock {
  kind: "lab";
  id: string;
  title: string;
  brief: string;
  runtimeId: string;
  successDiscoveries: string[];
  skillIds: string[];
}

export interface CodeTest {
  name: string;
  /** JS expression evaluated after the learner's code. */
  call: string;
  expected: unknown;
}

export interface CodeExerciseBlock {
  kind: "code-exercise";
  id: string;
  title: string;
  brief: string;
  language: "javascript";
  starterCode: string;
  tests: CodeTest[];
  skillIds: string[];
}

export interface RelatedMissionBlock {
  kind: "related-mission";
  incidentId: string;
  title: string;
  md: string;
}

export interface ReferenceBlock {
  kind: "references";
  items: Reference[];
}

export type LessonBlock =
  | TextBlock
  | CalloutBlock
  | VisualizationBlock
  | ExampleBlock
  | TerminalBlock
  | QuizBlock
  | LabBlock
  | CodeExerciseBlock
  | RelatedMissionBlock
  | ReferenceBlock;

export type LessonSectionKind =
  | "objective"
  | "mental-model"
  | "explanation"
  | "visualization"
  | "example"
  | "exercise"
  | "production"
  | "failure-mode"
  | "knowledge-check"
  | "lab"
  | "related-mission"
  | "references";

export interface LessonSection {
  id: string;
  kind: LessonSectionKind;
  title: string;
  blocks: LessonBlock[];
}

export interface Lesson {
  id: string;
  slug: string;
  phaseSlug: string;
  moduleSlug: string;
  order: number;
  title: string;
  description: string;
  durationMin: number;
  objectives: string[];
  skillIds: string[];
  relatedIncidentIds: string[];
  sections: LessonSection[];
  mentorContext: string;
}

export interface PhaseWithLessons extends PhaseMeta {
  lessons: Lesson[];
}

export const TRACKS: { id: TrackId; title: string; blurb: string }[] = [
  {
    id: "foundations",
    title: "Foundations",
    blurb: "How computers, programs, and networks actually work.",
  },
  {
    id: "production",
    title: "Production",
    blurb: "Cloud, delivery, Kubernetes, reliability, and security.",
  },
  {
    id: "platform",
    title: "Platform",
    blurb: "Paved roads, control planes, and developer experience.",
  },
  {
    id: "ai",
    title: "AI systems",
    blurb: "From gradients to GPU fleets and governed inference.",
  },
];
