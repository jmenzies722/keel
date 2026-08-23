import type { IncidentScenario } from "./types";

export function isResolved(
  scenario: IncidentScenario,
  state: Record<string, boolean | string | number>,
  discoveries: string[],
): boolean {
  const discoveriesOk = scenario.resolution.requiredDiscoveries.every((id) => discoveries.includes(id));
  const stateOk = Object.entries(scenario.resolution.requiredState).every(
    ([k, v]) => state[k] === v,
  );
  return discoveriesOk && stateOk;
}

export function applyEffects(
  state: Record<string, boolean | string | number>,
  effects?: Record<string, boolean | string | number>,
): Record<string, boolean | string | number> {
  if (!effects) return state;
  return { ...state, ...effects };
}
