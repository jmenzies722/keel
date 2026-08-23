import type { Lesson } from "@/lib/curriculum/types";

export const vllmLesson: Lesson = {
  id: "model-serving/vllm",
  slug: "vllm",
  phaseSlug: "model-serving",
  moduleSlug: "vllm",
  order: 1,
  title: "vLLM and the KV cache",
  description:
    "Prefill, decode, continuous batching, and why GPU utilization can be low while the queue is enormous.",
  durationMin: 40,
  objectives: [
    "Separate prefill (prompt) from decode (token-by-token).",
    "Explain the KV cache as memory reserved per token position.",
    "Read gpu_cache_usage, waiting queue, and SM util as three different signals.",
    "Name a memory-shaped SLO failure without saying “the GPU is slow.”",
  ],
  skillIds: ["serve.vllm", "gpu.computing", "ml.transformers"],
  relatedIncidentIds: ["inference-kv-cache"],
  mentorContext:
    "Learner is on vLLM. Distinguish SM util from VRAM from KV cache. Do not jump to the 32k flag until they ask the right question.",
  sections: [
    {
      id: "objective",
      kind: "objective",
      title: "Objective",
      blocks: [
        {
          kind: "text",
          md: "Training a model and **serving** a model are different jobs. Serving is an operations problem: latency, memory, and admission control. vLLM is one current implementation. The ideas outlive the binary.",
        },
      ],
    },
    {
      id: "mental-model",
      kind: "mental-model",
      title: "Mental model",
      blocks: [
        {
          kind: "text",
          md: "A transformer generates one token at a time. **Prefill** reads the prompt and fills the **KV cache**. **Decode** uses that cache so we do not recompute the whole prompt.\n\nThe cache is **memory**. `max-model-len` reserves how many token positions a sequence *may* occupy. Continuous batching admits new sequences only when free KV blocks exist. If the cache is ~full, the waiting queue grows and SM utilization can look idle. That is not a slow GPU. That is an admission failure.",
        },
      ],
    },
    {
      id: "visualization",
      kind: "visualization",
      title: "KV cache admission",
      blocks: [
        { kind: "visualization", visualization: "kv-cache", caption: "Blocks fill. New work waits. Compute idles." },
      ],
    },
    {
      id: "explanation",
      kind: "explanation",
      title: "Signals that matter",
      blocks: [
        {
          kind: "text",
          md: "- **SM util** — is the GPU computing?\n- **VRAM / framebuffer** — is memory occupied (weights + cache + activations)?\n- **gpu_cache_usage** — what fraction of the KV cache is live?\n- **num_requests_waiting** — admission queue\n- **TTFT / ITL** — time to first token / inter-token latency\n\nA useful sentence: “Cache 94%, waiting 2840, SM 38%” is a different incident than “SM 98%, waiting 0, p95 4s.”",
        },
      ],
    },
    {
      id: "example",
      kind: "example",
      title: "Worked example",
      blocks: [
        {
          kind: "example",
          title: "A flag that looks like a feature",
          language: "text",
          code: "--max-model-len 32768 --gpu-memory-utilization 0.95",
          md: "Product asked for 32k context. Each sequence now *reserves* a much larger potential cache. Occupancy goes up, admission goes down. The metric that moved first is cache usage, not temperature.",
        },
      ],
    },
    {
      id: "exercise",
      kind: "exercise",
      title: "Try it",
      blocks: [
        {
          kind: "terminal",
          runtimeId: "inference-preview",
          title: "Read serving metrics",
          brief: "On the preview node, pull vLLM metrics and nvidia-smi. Write down cache %, waiting, and SM util.",
          successDiscoveries: ["kv-cache-saturated", "queue-deep", "gpu-util-low"],
        },
      ],
    },
    {
      id: "production",
      kind: "production",
      title: "Why this matters in production",
      blocks: [
        {
          kind: "text",
          md: "An AI platform’s SLO is often TTFT and tokens/sec, not CPU. Autoscaling on CPU will add replicas of a memory-bound server and multiply the bill. Scale on queue depth and cache headroom — or change the reservation (`max-model-len`, prefix cache, quantization).",
        },
      ],
    },
    {
      id: "failure-mode",
      kind: "failure-mode",
      title: "Failure mode",
      blocks: [
        {
          kind: "callout",
          variant: "failure",
          title: "Restart the GPU node",
          md: "A restart reloads the same flags. The cache fills again. You have paid a cold-start and changed nothing about admission.",
        },
      ],
    },
    {
      id: "knowledge-check",
      kind: "knowledge-check",
      title: "Knowledge check",
      blocks: [
        {
          kind: "quiz",
          id: "vllm-quiz",
          title: "Serving",
          skillIds: ["serve.vllm"],
          questions: [
            {
              id: "q1",
              prompt: "Waiting=2840, gpu_cache_usage=0.94, SM=38%. Best first description?",
              options: [
                { id: "a", text: "The GPU is thermally throttling.", explanation: "Power 118W/700W and low SM disagree." },
                { id: "b", text: "Admission is blocked by KV-cache headroom; compute looks idle because it cannot batch new work.", explanation: "Correct." },
                { id: "c", text: "Pods are CrashLoopBackOff.", explanation: "You would see that in kubectl, not these metrics." },
                { id: "d", text: "Need more CPU replicas.", explanation: "This is GPU memory, not CPU." },
              ],
              correctOptionId: "b",
            },
            {
              id: "q2",
              prompt: "What does raising max-model-len primarily consume?",
              options: [
                { id: "a", text: "Disk inodes", explanation: "No." },
                { id: "b", text: "KV-cache reservation per sequence", explanation: "Correct." },
                { id: "c", text: "TLS handshakes", explanation: "Wrong layer." },
                { id: "d", text: "etcd", explanation: "No." },
              ],
              correctOptionId: "b",
            },
          ],
        },
      ],
    },
    {
      id: "lab",
      kind: "lab",
      title: "Lab",
      blocks: [
        {
          kind: "text",
          md: "The company preview incident *is* the lab: diagnose from metrics, do not restart the node. Open the related mission when you can state the constraint in one sentence.",
        },
      ],
    },
    {
      id: "related-mission",
      kind: "related-mission",
      title: "Related company mission",
      blocks: [
        {
          kind: "related-mission",
          incidentId: "inference-kv-cache",
          title: "Northstar · inference p95 4.1s",
          md: "Advanced. Same numbers as the lesson, no narrator, a diagnosis form at the end.",
        },
      ],
    },
    {
      id: "references",
      kind: "references",
      title: "References",
      blocks: [
        {
          kind: "references",
          items: [
            { kind: "vendor", title: "vLLM documentation — metrics and KV cache", note: "vLLM" },
            { kind: "vendor", title: "NVIDIA DCGM field identifiers", note: "GPU util vs memory" },
          ],
        },
      ],
    },
  ],
};
