import type { IncidentScenario } from "@/lib/simulator/types";
import { brokenDnsIncident } from "./broken-dns";
import { checkoutIncident } from "./checkout-api-crash";
import { crashloopIncident } from "./crashloop-backoff";
import { inferenceIncident } from "./inference-kv-cache";

export const INCIDENTS: IncidentScenario[] = [
  checkoutIncident,
  brokenDnsIncident,
  crashloopIncident,
  inferenceIncident,
];

export const INCIDENT_BY_ID = Object.fromEntries(INCIDENTS.map((i) => [i.id, i])) as Record<
  string,
  IncidentScenario
>;

export function getIncident(id: string): IncidentScenario | undefined {
  return INCIDENT_BY_ID[id];
}
