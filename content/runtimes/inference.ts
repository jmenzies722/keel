import { unknownLinux } from "@/lib/simulator/terminal";
import type { TerminalRuntimeSpec } from "@/lib/simulator/types";

export const inferenceRuntime: TerminalRuntimeSpec = {
  id: "inference-preview",
  hostname: "gpu-node-03",
  promptUser: "platform",
  cwd: "~",
  motd: "Northstar inference · gpu-node-03 · preview environment. Type `help`.",
  commands: [
    {
      match: "kubectl get pods -n inference",
      run: () => ({
        stdout: `NAME                         READY   STATUS    RESTARTS   AGE
vllm-llama3-8b-6f8d9c7b-xk2n  1/1    Running   0          4h
vllm-llama3-8b-6f8d9c7b-q9lw  1/1    Running   0          4h
gateway-7c4f5d9b6-mm12        1/1    Running   0          12d`,
        stderr: "",
        exitCode: 0,
        discoveries: ["pods-running"],
      }),
    },
    {
      match: "kubectl get pods",
      prefix: true,
      run: () => ({
        stdout: `NAME                         READY   STATUS    RESTARTS   AGE
vllm-llama3-8b-6f8d9c7b-xk2n  1/1    Running   0          4h
vllm-llama3-8b-6f8d9c7b-q9lw  1/1    Running   0          4h`,
        stderr: "",
        exitCode: 0,
        discoveries: ["pods-running"],
      }),
    },
    {
      match: "kubectl describe pod vllm-llama3-8b-6f8d9c7b-xk2n -n inference",
      run: () => ({
        stdout: `Name:         vllm-llama3-8b-6f8d9c7b-xk2n
Namespace:    inference
Node:         gpu-node-03/10.3.14.21
Status:       Running
Containers:
  vllm:
    Image:     vllm/vllm-openai:v0.8.5
    Requests:  nvidia.com/gpu: 1
    Limits:    nvidia.com/gpu: 1
    Args:      --model meta-llama/Llama-3.1-8B-Instruct --max-model-len 32768 --gpu-memory-utilization 0.95
Conditions:
  MemoryPressure=False  DiskPressure=False
Events:
  10m  Warning  GPUMemoryThrash  kv cache blocks evicted (94% utilization)`,
        stderr: "",
        exitCode: 0,
        discoveries: ["long-context", "kv-cache-event"],
      }),
    },
    {
      match: "nvidia-smi",
      run: () => ({
        stdout: `+-----------------------------------------------------------------------------+
| NVIDIA-SMI 550.90.07    Driver Version: 550.90.07    CUDA Version: 12.4   |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
|   0  NVIDIA H100 80GB     On  | 00000000:00:1E.0 Off |                    0 |
| N/A   71C    P0   118W / 700W |  72841MiB / 81559MiB |     38%      Default |
+-----------------------------------------------------------------------------+
`,
        stderr: "",
        exitCode: 0,
        discoveries: ["gpu-util-low", "vram-high"],
      }),
    },
    {
      match: "curl localhost:8000/metrics",
      run: () => ({
        stdout: `vllm:num_requests_waiting 2840
vllm:num_requests_running 2
vllm:gpu_cache_usage_perc 0.94
vllm:cpu_cache_usage_perc 0.00
vllm:avg_generation_throughput_toks_per_s 11.4
vllm:e2e_request_latency_seconds_bucket{le="4.0"} 182
vllm:e2e_request_latency_seconds_bucket{le="+Inf"} 2144
vllm:time_to_first_token_seconds_sum 6120
vllm:time_to_first_token_seconds_count 2144`,
        stderr: "",
        exitCode: 0,
        discoveries: ["kv-cache-saturated", "queue-deep", "throughput-collapsed"],
      }),
    },
    {
      match: "curl -s localhost:8000/metrics",
      run: (ctx) => inferenceRuntime.commands.find((c) => c.match === "curl localhost:8000/metrics")!.run(ctx),
    },
    {
      match: "dcgm",
      prefix: true,
      run: () => ({
        stdout: `GPU 0  H100 80GB
  DCGM_FI_DEV_GPU_UTIL            38
  DCGM_FI_DEV_MEM_COPY_UTIL       71
  DCGM_FI_DEV_FB_USED_PERCENT     91
  DCGM_FI_DEV_POWER_USAGE        118`,
        stderr: "",
        exitCode: 0,
        discoveries: ["dcgm-memory-bound"],
      }),
    },
    {
      match: "kubectl logs",
      prefix: true,
      run: () => ({
        stdout: `INFO 08-22 10:11:02 engine.py: Prefill batch size=1 (kv cache full; cannot schedule additional sequences)
INFO 08-22 10:11:08 engine.py: Waiting queue=2840 running=2
WARN 08-22 10:12:44 engine.py: Preemption due to insufficient KV cache blocks
INFO 08-22 10:13:02 metrics.py: gpu_cache_usage=0.94`,
        stderr: "",
        exitCode: 0,
        discoveries: ["kv-cache-saturated", "preemption"],
      }),
    },
  ],
  fallback: unknownLinux,
};
