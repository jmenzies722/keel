"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { evaluateIncident, evidenceWeight } from "@/lib/simulator/evaluate";
import type { IncidentAttempt, IncidentScenario } from "@/lib/simulator/types";
import type { Evidence, EvidenceSource, SkillDimension } from "@/lib/skills/types";
import { buildProgressMap, recommendNext } from "@/lib/skills/graph";
import { careerBand } from "./career";

export interface ProgressState {
  version: 1;
  joinedCompany: boolean;
  completedLessons: string[];
  completedSections: string[];
  resolvedIncidents: string[];
  evidence: Evidence[];
  attempts: IncidentAttempt[];
  hintCounts: Record<string, number>;
  lastActiveAt?: string;
  daysActive: string[];
  completedProjects: string[];
  completedInterviews: string[];
  onboarded: boolean;
  recordSection: (lessonKey: string, sectionId: string) => void;
  completeLesson: (lessonKey: string) => void;
  recordEvidence: (input: {
    skillId: string;
    source: EvidenceSource;
    dimension: SkillDimension;
    score: number;
    weight?: number;
    artifactId: string;
    note?: string;
  }) => void;
  joinCompany: () => void;
  startIncident: (incidentId: string) => void;
  appendCommand: (incidentId: string, command: string) => void;
  addDiscoveries: (incidentId: string, ids: string[]) => void;
  bumpHint: (artifactId: string) => void;
  markSymptomRestart: (incidentId: string) => void;
  resolveIncident: (scenario: IncidentScenario, diagnosisId?: string) => void;
  completeProject: (id: string) => void;
  completeInterview: (id: string) => void;
  markOnboarded: () => void;
  reset: () => void;
}

const emptyAttempt = (incidentId: string): IncidentAttempt => ({
  incidentId,
  commands: [],
  discoveries: [],
  hintsUsed: 0,
  symptomRestarts: 0,
  resolved: false,
  startedAt: new Date().toISOString(),
});

const initial = {
  version: 1 as const,
  joinedCompany: false,
  completedLessons: [] as string[],
  completedSections: [] as string[],
  resolvedIncidents: [] as string[],
  evidence: [] as Evidence[],
  attempts: [] as IncidentAttempt[],
  hintCounts: {} as Record<string, number>,
  daysActive: [] as string[],
  completedProjects: [] as string[],
  completedInterviews: [] as string[],
  onboarded: false,
};

function touch(daysActive: string[]): { daysActive: string[]; lastActiveAt: string } {
  const today = new Date().toISOString().slice(0, 10);
  return {
    lastActiveAt: new Date().toISOString(),
    daysActive: daysActive.includes(today) ? daysActive : [...daysActive, today],
  };
}

function upsertAttempt(attempts: IncidentAttempt[], incidentId: string): IncidentAttempt[] {
  if (attempts.some((a) => a.incidentId === incidentId && !a.resolved)) return attempts;
  const existing = attempts.find((a) => a.incidentId === incidentId);
  if (existing && !existing.resolved) return attempts;
  return [...attempts.filter((a) => a.incidentId !== incidentId), emptyAttempt(incidentId)];
}

function patchAttempt(
  attempts: IncidentAttempt[],
  incidentId: string,
  patch: (a: IncidentAttempt) => IncidentAttempt,
): IncidentAttempt[] {
  const withOne = upsertAttempt(attempts, incidentId);
  return withOne.map((a) => (a.incidentId === incidentId && !a.resolved ? patch(a) : a));
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,
      recordSection: (lessonKey, sectionId) =>
        set((s) => ({
          ...touch(s.daysActive),
          completedSections: s.completedSections.includes(`${lessonKey}:${sectionId}`)
            ? s.completedSections
            : [...s.completedSections, `${lessonKey}:${sectionId}`],
        })),
      completeLesson: (lessonKey) =>
        set((s) => ({
          ...touch(s.daysActive),
          completedLessons: s.completedLessons.includes(lessonKey)
            ? s.completedLessons
            : [...s.completedLessons, lessonKey],
        })),
      recordEvidence: (input) =>
        set((s) => ({
          ...touch(s.daysActive),
          evidence: [
            ...s.evidence,
            {
              id: `${input.artifactId}:${input.skillId}:${input.dimension}:${s.evidence.length}`,
              skillId: input.skillId,
              source: input.source,
              dimension: input.dimension,
              score: input.score,
              weight: input.weight ?? 1,
              at: new Date().toISOString(),
              artifactId: input.artifactId,
              note: input.note,
            },
          ],
        })),
      joinCompany: () => set((s) => ({ ...touch(s.daysActive), joinedCompany: true })),
      startIncident: (incidentId) =>
        set((s) => ({
          ...touch(s.daysActive),
          attempts: upsertAttempt(s.attempts, incidentId),
        })),
      appendCommand: (incidentId, command) =>
        set((s) => ({
          attempts: patchAttempt(s.attempts, incidentId, (a) => ({
            ...a,
            commands: [...a.commands, command],
          })),
        })),
      addDiscoveries: (incidentId, ids) =>
        set((s) => ({
          attempts: patchAttempt(s.attempts, incidentId, (a) => ({
            ...a,
            discoveries: [...new Set([...a.discoveries, ...ids])],
          })),
        })),
      bumpHint: (artifactId) =>
        set((s) => ({
          hintCounts: { ...s.hintCounts, [artifactId]: (s.hintCounts[artifactId] ?? 0) + 1 },
          attempts: s.attempts.map((a) =>
            a.incidentId === artifactId && !a.resolved ? { ...a, hintsUsed: a.hintsUsed + 1 } : a,
          ),
        })),
      markSymptomRestart: (incidentId) =>
        set((s) => ({
          attempts: patchAttempt(s.attempts, incidentId, (a) => ({
            ...a,
            symptomRestarts: a.symptomRestarts + 1,
          })),
        })),
      resolveIncident: (scenario, diagnosisId) => {
        const state = get();
        const attempt = state.attempts.find((a) => a.incidentId === scenario.id && !a.resolved);
        if (!attempt) return;
        const finished: IncidentAttempt = {
          ...attempt,
          resolved: true,
          diagnosisId,
          resolvedAt: new Date().toISOString(),
          discoveries: diagnosisId === scenario.rootCause.id
            ? [...new Set([...attempt.discoveries, "diagnosis-correct"])]
            : attempt.discoveries,
        };
        const evaluation = evaluateIncident(scenario, finished);
        const weight = evidenceWeight(evaluation, finished.hintsUsed);
        set({
          ...touch(state.daysActive),
          attempts: state.attempts.map((a) => (a === attempt ? finished : a)),
          resolvedIncidents: state.resolvedIncidents.includes(scenario.id)
            ? state.resolvedIncidents
            : [...state.resolvedIncidents, scenario.id],
          evidence: [
            ...state.evidence,
            ...scenario.evidenceSkills.map((row, i) => ({
              id: `${scenario.id}:${row.skillId}:${row.dimension}:${state.evidence.length + i}`,
              skillId: row.skillId,
              source: "incident" as const,
              dimension: row.dimension,
              score: evaluation.overall,
              weight,
              at: new Date().toISOString(),
              artifactId: scenario.id,
            })),
          ],
        });
      },
      completeProject: (id) =>
        set((s) => ({
          ...touch(s.daysActive),
          completedProjects: s.completedProjects.includes(id) ? s.completedProjects : [...s.completedProjects, id],
        })),
      completeInterview: (id) =>
        set((s) => ({
          ...touch(s.daysActive),
          completedInterviews: s.completedInterviews.includes(id)
            ? s.completedInterviews
            : [...s.completedInterviews, id],
        })),
      markOnboarded: () => set((s) => ({ ...touch(s.daysActive), onboarded: true })),
      reset: () => set({ ...initial, hintCounts: {}, attempts: [], evidence: [] }),
    }),
    {
      name: "keel-progress-v1",
      merge: (persisted, current) => ({
        ...current,
        ...(typeof persisted === "object" && persisted ? persisted : {}),
      }),
    },
  ),
);

export function useDerivedProgress() {
  const evidence = useProgress((s) => s.evidence);
  const completedLessons = useProgress((s) => s.completedLessons);
  const resolvedIncidents = useProgress((s) => s.resolvedIncidents);
  const daysActive = useProgress((s) => s.daysActive);
  const progress = buildProgressMap(evidence);
  const band = careerBand(progress);
  const recommendation = recommendNext({ progress, completedLessons, resolvedIncidents });
  const streak = currentStreak(daysActive);
  return { progress, band, recommendation, streak };
}

export function currentStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  if (!set.has(todayKey) && !set.has(yesterdayKey)) return 0;
  const cursor = new Date(set.has(todayKey) ? today : yesterday);
  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (streak > 400) break;
  }
  return streak;
}
