import type { IncidentScenario } from "@/lib/simulator/types";

export const crashloopIncident: IncidentScenario = {
  id: "crashloop-backoff",
  title: "checkout-api CrashLoopBackOff",
  severity: "SEV-2",
  companyStage: "cloud-native",
  summary:
    "Checkout on EKS is CrashLoopBackOff after a mid-day “secret hygiene” change. Database pod is Running. Ingress returns 502.",
  impact: "100% of in-cluster checkout traffic failing. Restart count = 7.",
  requiredSkills: ["k8s.workloads", "linux.processes"],
  evidenceSkills: [
    { skillId: "k8s.workloads", dimension: "debugging" },
    { skillId: "k8s.workloads", dimension: "operational" },
    { skillId: "k8s.architecture", dimension: "conceptual" },
  ],
  symptoms: [
    {
      id: "clb",
      system: "status",
      title: "Pod status",
      body: "checkout-api-7d8f9c6b5-xk21  0/1  CrashLoopBackOff  7",
    },
    {
      id: "db",
      system: "status",
      title: "Postgres",
      body: "checkout-db-0 is Running. Easy to blame the database.",
      misleading: true,
    },
    {
      id: "change",
      system: "deploy",
      title: "Secret cleanup",
      body: "Platform ticket: delete unused Opaque secrets in checkout. checkout-db was on the list.",
    },
  ],
  systems: ["terminal", "kubernetes", "logs"],
  rootCause: {
    id: "missing-secret",
    summary: "Secret checkout-db was deleted. The Deployment still envFrom’s it.",
    detail:
      "The container starts, finds DATABASE_URL empty, exits 2. kubelet backs off. Deleting the pod recreates the same missing mount.",
  },
  discoveries: [
    { id: "pod-crashing", label: "Pod is CrashLoopBackOff", detail: "kubectl get pods" },
    { id: "missing-secret", label: "Event: secret checkout-db not found", detail: "describe" },
    { id: "empty-env", label: "Logs: DATABASE_URL unset", detail: "logs" },
    { id: "secret-applied", label: "Secret recreated from runbook", detail: "kubectl apply" },
    { id: "pod-running", label: "Pod Running 1/1", detail: "get pods" },
    { id: "verified-healthy", label: "Service /health 200", detail: "curl" },
    { id: "symptom-restart", label: "Deleted the pod without restoring the secret", detail: "kubectl delete" },
  ],
  validInvestigations: [
    { id: "get", label: "Read pod status", discoveryIds: ["pod-crashing"] },
    { id: "describe", label: "Read events", discoveryIds: ["missing-secret"] },
    { id: "fix", label: "Apply the secret", discoveryIds: ["secret-applied"] },
    { id: "verify", label: "Confirm Running and health", discoveryIds: ["pod-running", "verified-healthy"] },
  ],
  resolution: {
    requiredDiscoveries: ["secret-applied", "pod-running", "verified-healthy"],
    requiredState: { secretPresent: true },
    successMessage: "Deployment has a DSN again. Ingress 502s should clear.",
  },
  debrief: {
    whatHappened:
      "A hygiene script deleted a secret still referenced by a live Deployment. Kubernetes did exactly what systemd would do: restart a process that cannot start.",
    productionLesson:
      "get → describe → logs. Restore the missing object. Do not delete the pod to “reset” a BackOff that is telling the truth.",
    recommendedPath: [
      "kubectl get pods -n checkout",
      "kubectl describe pod checkout-api-7d8f9c6b5-xk21 -n checkout",
      "kubectl logs checkout-api-7d8f9c6b5-xk21 -n checkout",
      "kubectl apply -f /opt/runbooks/checkout-secret.yaml",
      "kubectl get pods -n checkout",
      "curl checkout-api.checkout.svc/health",
    ],
    relatedLessonHref: "/learn/kubernetes/workloads",
    relatedLessonTitle: "Kubernetes workloads",
  },
  runtimeId: "k8s-lab",
  initialState: { secretPresent: false },
};
