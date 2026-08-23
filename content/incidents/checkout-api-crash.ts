import type { IncidentScenario } from "@/lib/simulator/types";

export const checkoutIncident: IncidentScenario = {
  id: "checkout-api-crash",
  title: "checkout-api restart loop",
  severity: "SEV-2",
  companyStage: "startup",
  summary:
    "Checkout API latency and errors spiked 18 minutes after a deploy. systemd is restarting the unit. Customers cannot complete payment.",
  impact: "18% of checkout attempts failing. p95 unavailable (origin down).",
  requiredSkills: ["linux.processes", "linux.cli"],
  evidenceSkills: [
    { skillId: "linux.processes", dimension: "debugging" },
    { skillId: "linux.processes", dimension: "operational" },
    { skillId: "linux.cli", dimension: "implementation" },
    { skillId: "sre.slo", dimension: "reliability" },
  ],
  symptoms: [
    {
      id: "errors",
      system: "metrics",
      title: "Origin 5xx",
      body: "checkout-api 5xx: 62% of requests since 10:22 UTC. Edge is returning 502.",
    },
    {
      id: "restarts",
      system: "status",
      title: "Unit restarts",
      body: "systemd restart counter = 47. RestartSec=5.",
    },
    {
      id: "deploy",
      system: "deploy",
      title: "Deploy 1.14.2",
      body: "Shipped 18 minutes ago. CHECKOUT_WORKERS raised from 8 to 16.",
      misleading: true,
    },
    {
      id: "memory",
      system: "metrics",
      title: "Host memory",
      body: "Host memory 41% used. No OOM in dmesg. Easy to over-index on the worker change.",
      misleading: true,
    },
  ],
  systems: ["terminal", "logs", "metrics"],
  rootCause: {
    id: "orphan-port",
    summary: "An orphaned checkout-api process still holds :8080.",
    detail:
      "The deploy’s stop timed out (TimeoutStopSec=7). systemd sent SIGKILL to the main PID, but a leftover process (PID 1842) kept the listen socket. Every new ExecStart fails with EADDRINUSE. Restart=always turns a bind failure into a restart storm.",
  },
  discoveries: [
    { id: "service-failed", label: "Unit is in auto-restart / exit-code", detail: "systemctl status" },
    { id: "address-in-use", label: "Bind failure on :8080", detail: "journalctl" },
    { id: "orphan-process", label: "PID 1842 still running checkout-api", detail: "ps" },
    { id: "port-holder", label: "PID 1842 owns :8080", detail: "ss / lsof" },
    { id: "orphan-killed", label: "Orphan process terminated", detail: "kill 1842" },
    { id: "service-started", label: "Unit started cleanly", detail: "systemctl start" },
    { id: "verified-healthy", label: "Health check 200", detail: "curl /health or systemctl status" },
    { id: "memory-ok", label: "Host memory is not the constraint", detail: "free" },
    { id: "disk-ok", label: "Disk is not exhausted", detail: "df" },
    { id: "rushed-deploy", label: "Stop timed out during deploy", detail: "journal" },
    { id: "unit-file", label: "Read the unit file", detail: "TimeoutStopSec=7, Restart=always" },
    { id: "symptom-restart", label: "Restarted the unit without freeing the port", detail: "systemctl restart while orphan lives" },
  ],
  validInvestigations: [
    { id: "status", label: "Inspect unit state", discoveryIds: ["service-failed"] },
    { id: "logs", label: "Read the unit journal", discoveryIds: ["address-in-use"] },
    { id: "owner", label: "Identify who holds the port", discoveryIds: ["port-holder", "orphan-process"] },
    { id: "remediate", label: "Remove the orphan and start the unit", discoveryIds: ["orphan-killed", "service-started"] },
    { id: "verify", label: "Verify health", discoveryIds: ["verified-healthy"] },
  ],
  resolution: {
    requiredDiscoveries: ["address-in-use", "orphan-killed", "service-started", "verified-healthy"],
    requiredState: { orphanAlive: false, serviceActive: true },
    successMessage: "checkout-api is active. /health returns ok. Restart storm has stopped.",
  },
  debrief: {
    whatHappened:
      "A deploy asked systemd to stop checkout-api. The process did not drain within TimeoutStopSec=7. SIGKILL removed the supervised PID from the unit’s cgroup accounting, but PID 1842 kept the listen socket. The new binary could not bind. Restart=always converted that into 47 failed starts.",
    productionLesson:
      "Restart loops are a symptom. KillMode, TimeoutStopSec, and leftover sockets are part of the process model — the same model the lesson taught. Treating the symptom (restart again) leaves the orphan in place.",
    recommendedPath: [
      "systemctl status checkout-api",
      "journalctl -u checkout-api",
      "ss -lntp  (or ps aux)",
      "kill 1842",
      "systemctl start checkout-api",
      "curl localhost:8080/health",
    ],
    relatedLessonHref: "/learn/linux-os/processes",
    relatedLessonTitle: "Linux Processes",
  },
  runtimeId: "checkout-api",
  initialState: { orphanAlive: true, serviceActive: false },
};
