export interface InterviewItem {
  id: string;
  title: string;
  skillIds: string[];
  prompt: string;
  keywords: string[];
  followUp: string;
  strongAnswer: string;
}

export const INTERVIEWS: InterviewItem[] = [
  {
    id: "linux-processes",
    title: "Linux processes",
    skillIds: ["linux.processes"],
    prompt:
      "systemd says a unit is failed, but ss shows something listening on the unit’s port. What are the distinct objects involved, and what do you do first?",
    keywords: ["unit", "process", "pid", "journal", "systemctl", "port"],
    followUp: "What would Restart=always do in that situation, and why might that be the wrong first action?",
    strongAnswer:
      "The unit, the main PID systemd tracks, and any leftover process holding the fd are different objects. Read systemctl status and journalctl before changing state. Restarting can leave the listener in place.",
  },
  {
    id: "dns",
    title: "DNS",
    skillIds: ["net.dns"],
    prompt: "dig @8.8.8.8 shows the new A record. curl on the server still hits the old IP. Walk the lookup.",
    keywords: ["hosts", "stub", "resolver", "nsswitch", "getent"],
    followUp: "Where does nsswitch fit, and how would you prove it on the box?",
    strongAnswer:
      "The stub path (nsswitch → hosts, then DNS) is not the same as querying a public resolver. getent vs dig @server isolates an override.",
  },
  {
    id: "k8s",
    title: "CrashLoopBackOff",
    skillIds: ["k8s.workloads"],
    prompt: "A Deployment is CrashLoopBackOff. What do the first three commands tell you, and what does delete not tell you?",
    keywords: ["get", "describe", "logs", "event", "secret", "backoff"],
    followUp: "Give an example where logs and events disagree — which do you trust for a missing mount?",
    strongAnswer:
      "get = state, describe = events (missing secret, OOM), logs = process exit. delete creates a new PID with the same spec and drops events.",
  },
  {
    id: "vllm",
    title: "Inference latency",
    skillIds: ["serve.vllm"],
    prompt: "p95 is 4s, GPU SM util is 38%, VRAM 91%, KV cache 94%, waiting 2800. Diagnose in one paragraph.",
    keywords: ["kv", "cache", "admission", "queue", "batch", "memory"],
    followUp: "Why would adding CPU replicas fail to fix this?",
    strongAnswer:
      "Admission is blocked by KV-cache headroom. Compute is idle because new sequences cannot be batched. This is memory-shaped, not SM-shaped. Recover reservation (context, prefix cache, replica on GPU, quantization).",
  },
];
