import type { IncidentScenario } from "@/lib/simulator/types";

export const inferenceIncident: IncidentScenario = {
  id: "inference-kv-cache",
  title: "Inference p95 at 4.1s",
  severity: "SEV-2",
  companyStage: "ai-company",
  preview: true,
  summary:
    "Customer-facing assistant p95 rose from 420ms to 4.1s. GPU utilization is 38%. GPU memory is 91%. The waiting queue is 2,840. KV cache is 94%.",
  impact: "Conversational product degraded. Token cost per successful reply is up 4.6×.",
  requiredSkills: ["serve.vllm", "ai.observability", "gpu.computing"],
  evidenceSkills: [
    { skillId: "serve.vllm", dimension: "debugging" },
    { skillId: "ai.observability", dimension: "operational" },
    { skillId: "gpu.computing", dimension: "conceptual" },
  ],
  symptoms: [
    {
      id: "p95",
      system: "metrics",
      title: "Gateway p95",
      body: "p50 210ms · p95 4.1s · p99 9.8s. TTFT dominates.",
    },
    {
      id: "gpu",
      system: "metrics",
      title: "GPU",
      body: "SM utilization 38%. Framebuffer 91%. Power 118W / 700W.",
    },
    {
      id: "queue",
      system: "metrics",
      title: "vLLM queue",
      body: "waiting=2840 running=2. Throughput 11 tok/s.",
    },
    {
      id: "rollout",
      system: "deploy",
      title: "max-model-len 32k",
      body: "This morning max-model-len was raised 8k → 32k to support a long-context feature.",
    },
  ],
  systems: ["terminal", "metrics", "kubernetes", "inference"],
  rootCause: {
    id: "kv-cache-saturated",
    summary: "KV cache saturation collapsed continuous batching.",
    detail:
      "Raising max-model-len to 32k reserved far more KV blocks per sequence. The cache sits at 94%, so the engine cannot admit waiting requests. Running count stays at 2. Compute looks idle; memory and memcpy look busy. Restarting pods would only replay the same reservation.",
  },
  discoveries: [
    { id: "pods-running", label: "Serving pods are Running (not CrashLoop)", detail: "kubectl get pods" },
    { id: "gpu-util-low", label: "SM util 38%", detail: "nvidia-smi" },
    { id: "vram-high", label: "VRAM ~91%", detail: "nvidia-smi" },
    { id: "kv-cache-saturated", label: "gpu_cache_usage 94%", detail: "vLLM metrics" },
    { id: "queue-deep", label: "2840 waiting requests", detail: "vLLM metrics" },
    { id: "throughput-collapsed", label: "11 tok/s", detail: "vLLM metrics" },
    { id: "long-context", label: "max-model-len 32768", detail: "pod spec" },
    { id: "dcgm-memory-bound", label: "DCGM memcpy high, SM low", detail: "dcgm" },
    { id: "preemption", label: "Engine preempting for KV blocks", detail: "logs" },
    { id: "diagnosis-correct", label: "Named the KV-cache admission failure", detail: "diagnosis" },
  ],
  validInvestigations: [
    { id: "k8s", label: "Confirm the workload is scheduled", discoveryIds: ["pods-running"] },
    { id: "gpu", label: "Split SM util from VRAM", discoveryIds: ["gpu-util-low", "vram-high"] },
    { id: "vllm", label: "Read vLLM queue and cache", discoveryIds: ["kv-cache-saturated", "queue-deep"] },
    { id: "cause", label: "Connect the 32k context change", discoveryIds: ["long-context"] },
  ],
  resolution: {
    requiredDiscoveries: ["kv-cache-saturated", "queue-deep", "diagnosis-correct"],
    requiredState: {},
    successMessage:
      "Diagnosis accepted. The serving fleet does not need a restart; it needs KV-cache headroom (context, prefix cache, replica, or quantization).",
  },
  debrief: {
    whatHappened:
      "A product request for 32k context changed the memory reservation of every sequence. Continuous batching requires free KV blocks to admit work. At 94% cache use the waiting queue is the real backlog; the GPU is not 'slow'.",
    productionLesson:
      "Inference SLOs are memory-shaped. GPU utilization alone will send you to the wrong fix. Pair DCGM, vLLM cache metrics, and the last serving-flag change.",
    recommendedPath: [
      "kubectl get pods -n inference",
      "nvidia-smi",
      "curl localhost:8000/metrics",
      "kubectl logs (preemption / kv full)",
      "Name the constraint: KV cache admission, not SM speed",
    ],
    relatedLessonHref: "/roadmap#model-serving",
    relatedLessonTitle: "Model Serving + vLLM (catalog)",
  },
  runtimeId: "inference-preview",
  diagnosisOptions: [
    {
      id: "gpu-slow",
      text: "The H100 is thermally throttling; replace the node.",
      correct: false,
    },
    {
      id: "need-more-replicas-only",
      text: "Add 20 replicas immediately. Ignore cache metrics.",
      correct: false,
    },
    {
      id: "kv-cache-saturated",
      text: "KV cache is saturated after the 32k context change, so new sequences cannot be batched. Recover cache headroom.",
      correct: true,
    },
    {
      id: "crashloop",
      text: "Pods are CrashLoopBackOff on a missing GPU driver.",
      correct: false,
    },
  ],
};
