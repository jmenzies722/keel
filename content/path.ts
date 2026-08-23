/**
 * The authored spine. Recommendations, the Learn hub, and stage unlocks
 * walk this list — not a pile of disconnected pages.
 */
export interface PathNode {
  id: string;
  lesson: string;
  title: string;
  incident?: string;
  incidentTitle?: string;
  stageAfter?: "startup" | "saas" | "cloud-native" | "ai-company";
}

export const AUTHORED_PATH: PathNode[] = [
  {
    id: "representation",
    lesson: "computing-foundations/representation",
    title: "Data representation",
  },
  {
    id: "processes",
    lesson: "linux-os/processes",
    title: "Linux processes",
    incident: "checkout-api-crash",
    incidentTitle: "SEV-2 · checkout-api restart loop",
    stageAfter: "startup",
  },
  {
    id: "dns",
    lesson: "networking/dns",
    title: "DNS",
    incident: "broken-dns",
    incidentTitle: "SEV-2 · checkout.northstar.internal NXDOMAIN",
    stageAfter: "saas",
  },
  {
    id: "workloads",
    lesson: "kubernetes/workloads",
    title: "Kubernetes workloads",
    incident: "crashloop-backoff",
    incidentTitle: "SEV-2 · checkout-api CrashLoopBackOff",
    stageAfter: "cloud-native",
  },
  {
    id: "vllm",
    lesson: "model-serving/vllm",
    title: "vLLM and the KV cache",
    incident: "inference-kv-cache",
    incidentTitle: "SEV-2 · inference p95 4.1s",
    stageAfter: "ai-company",
  },
];

export function pathLessonKeys(): string[] {
  return AUTHORED_PATH.map((n) => n.lesson);
}
