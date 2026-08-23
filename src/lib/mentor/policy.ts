export type MentorMode =
  | "teach"
  | "socratic"
  | "hint"
  | "debug"
  | "review-code"
  | "review-architecture"
  | "interview"
  | "incident-coach";

export type HintLevel = 1 | 2 | 3 | 4 | 5;

export interface MentorTurn {
  role: "learner" | "mentor";
  text: string;
}

export interface MentorContext {
  mode: MentorMode;
  hintLevel: HintLevel;
  lessonId?: string;
  incidentId?: string;
  discoveries: string[];
  lastCommands: string[];
}

const HINTS: Record<string, string[]> = {
  "linux-os/processes": [
    "Decide whether you are looking at a process, a unit, or a log stream. Those are three different objects.",
    "A systemd service is a unit that supervises a process. `systemctl status` talks about the unit; `ps` talks about the process table.",
    "Try `ps aux` and `systemctl status`. One shows living processes; the other shows whether a supervisor believes the service is healthy.",
    "If a unit is in a restart loop, `journalctl -u <name>` is usually the next command — not reboot, not kill -9 on PID 1.",
    "A process that has exited can still occupy a port if a leftover child or previous instance was not reaped. The unit failing to bind is a clue about another PID.",
  ],
  "checkout-api-crash": [
    "Start with the unit, not the application source. What does systemd think is happening?",
    "Distinguish 'exited', 'killed', and 'failed to start'. Those three lead to different next commands.",
    "`systemctl status` and `journalctl -u checkout-api` are the first two instruments. Read them before changing state.",
    "If the log mentions a bind failure, something else is already sitting on that address. `ss` and `ps` will name it.",
    "An orphaned checkout-api process still holds :8080. The unit cannot start until that PID is gone. Then start the unit and verify /health.",
  ],
  "computing-foundations/representation": [
    "A bit is a distinction. Count the states, not the digits in the decimal number.",
    "Hex is binary grouped by fours. One byte is two hex digits.",
    "Write 13 in binary by peeling off powers of two: 8+4+1.",
    "toBinary(13) should be 1101. toHex(74) is 4a. fromBinary reads the same bits back.",
    "Implement integer conversion with parseInt / toString(2) / toString(16) if you are stuck — then rewrite it so you can explain each step.",
  ],
  "networking/dns": [
    "Name the resolver you queried before you accuse the zone.",
    "getent uses the stub path (nsswitch, hosts). dig @IP talks to a specific server.",
    "If those two disagree, something on the box is winning. cat /etc/hosts.",
    "A leftover A record in /etc/hosts will outrank a correct zone.",
    "Remove the checkout.northstar.internal line from /etc/hosts, then curl the name again.",
  ],
  "broken-dns": [
    "The origin may be healthy. That does not mean the name is.",
    "Compare the stub (getent, curl) with an explicit resolver (dig @10.0.0.53).",
    "If they disagree, you are not looking at DNS yet — you are looking at the host.",
    "/etc/hosts is the usual override. It is not a cache; it is a pin.",
    "Delete the hosts line for checkout.northstar.internal and verify /health via the name.",
  ],
  "kubernetes/workloads": [
    "A CrashLoop is a process exiting. Start with get, then describe, then logs.",
    "Pending, ImagePullBackOff, and CrashLoopBackOff are different sentences.",
    "describe events often name a missing object before logs do.",
    "If the event says a secret is missing, deleting the pod will not create the secret.",
    "Apply /opt/runbooks/checkout-secret.yaml, then get pods and curl health.",
  ],
  "crashloop-backoff": [
    "Do not start with kubectl delete. Ask what the kubelet already knows.",
    "get → describe → logs. Write down status, events, and exit reason.",
    "A Running database pod does not prove the API has a DSN.",
    "Events mentioning a missing secret are the constraint. Restore that object.",
    "kubectl apply -f /opt/runbooks/checkout-secret.yaml, then verify Running and /health.",
  ],
  "model-serving/vllm": [
    "Write down SM util, VRAM, and KV cache as three numbers, not one “GPU is bad.”",
    "A deep waiting queue with a full cache is an admission problem.",
    "max-model-len is a reservation. Reservations consume blocks whether you use them or not.",
    "If cache is ~94% and waiting is thousands, new sequences cannot be batched.",
    "Do not restart the node. Recover cache headroom (context, prefix cache, replica, quantization).",
  ],
  "inference-kv-cache": [
    "GPU utilization and GPU memory are not the same signal. Write down both before proposing a cause.",
    "A large queue with low compute utilization usually means the server cannot admit work — not that the GPU is 'slow'.",
    "Look at KV cache utilization next to queue depth and batch size. Memory-bound serving looks idle on SM% and full on VRAM.",
    "If KV cache is ~94% and waiting requests are in the thousands, new sequences cannot be batched. That is an admission-control / context-memory problem.",
    "Root cause: the KV cache is saturated, so continuous batching collapses. Compute sits idle while the queue grows. Fix memory pressure (context length, prefix cache, replica, or quantization) — not 'restart the GPU node'.",
  ],
};

function keyFor(ctx: MentorContext): string {
  return ctx.incidentId ?? ctx.lessonId ?? "linux-os/processes";
}

export function mentorReply(question: string, ctx: MentorContext): string {
  const q = question.toLowerCase();
  const key = keyFor(ctx);
  const ladder = HINTS[key] ?? HINTS["linux-os/processes"];

  if (ctx.mode === "teach") {
    return ladder[4];
  }
  if (ctx.hintLevel >= 5) {
    return ladder[4];
  }

  if (q.includes("what's wrong") || q.includes("whats wrong") || q.includes("root cause") || q.includes("just tell")) {
    if (ctx.mode === "socratic" || ctx.mode === "incident-coach" || ctx.mode === "debug") {
      return ladder[Math.min(ctx.hintLevel, 3) - 1] ?? ladder[0];
    }
  }

  if (ctx.discoveries.includes("address-in-use") && (q.includes("now") || q.includes("next"))) {
    return "The log already named a bind failure. Which process currently owns that port, and is it the one systemd is trying to start?";
  }

  if (ctx.discoveries.includes("kv-cache-saturated") && ctx.incidentId === "inference-kv-cache") {
    return "You have a saturated KV cache and a deep queue. What would adding another replica change, and what would shrinking the context window change?";
  }

  if (ctx.lastCommands.some((c) => c.startsWith("systemctl restart"))) {
    return "A restart changes process identity. It does not change whatever condition made the previous process fail. What evidence would tell you whether the condition is still present?";
  }

  const idx = Math.min(ctx.hintLevel, 5) - 1;
  const preface =
    ctx.mode === "interview"
      ? "I'll treat this as a follow-up, not a lecture. "
      : "I will not start with the answer. ";

  return `${preface}${ladder[idx]}`;
}

export function nextHintLevel(current: HintLevel): HintLevel {
  return Math.min(5, current + 1) as HintLevel;
}
