import type { IncidentScenario } from "@/lib/simulator/types";

export const brokenDnsIncident: IncidentScenario = {
  id: "broken-dns",
  title: "checkout.northstar.internal unreachable",
  severity: "SEV-2",
  companyStage: "saas",
  summary:
    "After this morning’s cutover, 31% of checkout attempts fail from the edge. The API process on the new host is healthy. Clients still land on 10.0.1.9.",
  impact: "Edge 5xx / no route to 10.0.1.9. New VIP 10.0.4.12 answers /health.",
  requiredSkills: ["net.dns", "linux.cli"],
  evidenceSkills: [
    { skillId: "net.dns", dimension: "debugging" },
    { skillId: "net.dns", dimension: "operational" },
    { skillId: "net.tcpip", dimension: "conceptual" },
  ],
  symptoms: [
    {
      id: "edge",
      system: "metrics",
      title: "Edge errors",
      body: "31% of checkout host lookups still resolve to 10.0.1.9 — decommissioned at 09:40.",
    },
    {
      id: "zone",
      system: "status",
      title: "Zone file",
      body: "Authoritative ns1 (10.0.0.53) serves 10.0.4.12. TTL 30s.",
    },
    {
      id: "api",
      system: "metrics",
      title: "New origin",
      body: "10.0.4.12 /health is 200. Easy to restart the API anyway.",
      misleading: true,
    },
  ],
  systems: ["terminal", "logs"],
  rootCause: {
    id: "hosts-override",
    summary: "/etc/hosts on edge-01 still pins checkout.northstar.internal to 10.0.1.9.",
    detail:
      "A leftover override from last year’s “temporary” cutover. dig @10.0.0.53 is correct. The stub (getent, curl) never asks the resolver.",
  },
  discoveries: [
    { id: "hosts-override", label: "Hosts file pins the old IP", detail: "cat /etc/hosts" },
    { id: "auth-record", label: "Authoritative A is 10.0.4.12", detail: "dig @10.0.0.53" },
    { id: "old-ip-dead", label: "10.0.1.9 is unreachable", detail: "curl / ping" },
    { id: "hosts-cleared", label: "Override removed", detail: "sed" },
    { id: "resolution-agrees", label: "Stub and authority agree", detail: "getent after fix" },
    { id: "verified-healthy", label: "Health via the name succeeds", detail: "curl" },
  ],
  validInvestigations: [
    { id: "compare", label: "Compare stub vs authority", discoveryIds: ["hosts-override", "auth-record"] },
    { id: "fix", label: "Remove the override", discoveryIds: ["hosts-cleared"] },
    { id: "verify", label: "Verify the name", discoveryIds: ["verified-healthy"] },
  ],
  resolution: {
    requiredDiscoveries: ["hosts-cleared", "verified-healthy"],
    requiredState: { hostsOverride: false },
    successMessage: "Stub resolution follows the zone. Edge errors should drain with client TTL.",
  },
  debrief: {
    whatHappened:
      "The zone was updated. edge-01 never consulted it for this name. /etc/hosts won, as nsswitch is written to do.",
    productionLesson:
      "Always name the resolver you queried. dig and getent are different instruments. A healthy origin does not fix a lying stub.",
    recommendedPath: [
      "getent hosts checkout.northstar.internal",
      "dig @10.0.0.53 checkout.northstar.internal",
      "cat /etc/hosts",
      "sed -i '/checkout.northstar.internal/d' /etc/hosts",
      "curl checkout.northstar.internal/health",
    ],
    relatedLessonHref: "/learn/networking/dns",
    relatedLessonTitle: "DNS",
  },
  runtimeId: "dns-lab",
  initialState: { hostsOverride: true },
};
