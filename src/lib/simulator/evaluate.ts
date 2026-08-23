import type { IncidentAttempt, IncidentScenario } from "./types";

export interface Evaluation {
  resolved: boolean;
  diagnosis: number;
  commandChoice: number;
  order: number;
  unnecessary: number;
  hints: number;
  remediation: number;
  verification: number;
  overall: number;
  strongDecisions: string[];
  missedSignals: string[];
  yourPath: string[];
}

const NOISE = new Set(["help", "ls", "ls -la", "pwd", "whoami", "date", "uname -a"]);

export function evaluateIncident(scenario: IncidentScenario, attempt: IncidentAttempt): Evaluation {
  const discovered = new Set(attempt.discoveries);
  const required = scenario.resolution.requiredDiscoveries;
  const foundRequired = required.filter((id) => discovered.has(id)).length;
  const diagnosis = required.length === 0 ? 0 : foundRequired / required.length;

  const useful = attempt.commands.filter((c) => !NOISE.has(c.trim()));
  const commandChoice = useful.length === 0 ? 0 : Math.min(1, useful.length / 6);

  const firstUsefulIdx = attempt.commands.findIndex((c) =>
    /systemctl|journalctl|ps |ss |lsof|kubectl|vllm|dcgm|nvidia/.test(c),
  );
  const jumpedToRestart = attempt.commands.findIndex((c) => /systemctl (restart|start)/.test(c));
  const order =
    firstUsefulIdx === -1
      ? 0.2
      : jumpedToRestart !== -1 && jumpedToRestart < firstUsefulIdx
        ? 0.25
        : 0.85;

  const unnecessary = Math.max(0, 1 - attempt.symptomRestarts * 0.35 - Math.max(0, useful.length - 14) * 0.04);
  const hints = Math.max(0, 1 - attempt.hintsUsed * 0.15);
  const remediation = attempt.resolved ? 1 : 0.15;
  const verification = attempt.discoveries.includes("verified-healthy") || attempt.discoveries.includes("diagnosis-correct")
    ? 1
    : attempt.resolved
      ? 0.6
      : 0.1;

  const overall =
    diagnosis * 0.22 +
    commandChoice * 0.1 +
    order * 0.12 +
    unnecessary * 0.1 +
    hints * 0.08 +
    remediation * 0.26 +
    verification * 0.12;

  const strongDecisions: string[] = [];
  if (discovered.has("service-failed") || discovered.has("pod-waiting")) {
    strongDecisions.push("Started from current state rather than guessing a fix.");
  }
  if (discovered.has("address-in-use") || discovered.has("kv-cache-saturated")) {
    strongDecisions.push("Read the signal that named the constraint, not only the symptom.");
  }
  if (attempt.symptomRestarts === 0) {
    strongDecisions.push("Did not restart blindly.");
  }
  if (discovered.has("verified-healthy") || discovered.has("diagnosis-correct")) {
    strongDecisions.push("Verified the system after acting.");
  }

  const missedSignals = scenario.discoveries
    .filter((d) => required.includes(d.id) && !discovered.has(d.id))
    .map((d) => d.label);

  return {
    resolved: attempt.resolved,
    diagnosis,
    commandChoice,
    order,
    unnecessary,
    hints,
    remediation,
    verification,
    overall,
    strongDecisions,
    missedSignals,
    yourPath: attempt.commands,
  };
}

export function evidenceWeight(evaluation: Evaluation, hintsUsed: number): number {
  return Math.max(0.35, evaluation.overall * (1 - Math.min(0.4, hintsUsed * 0.08)));
}
