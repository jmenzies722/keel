import type { Lesson } from "@/lib/curriculum/types";

export const workloadsLesson: Lesson = {
  id: "kubernetes/workloads",
  slug: "workloads",
  phaseSlug: "kubernetes",
  moduleSlug: "workloads",
  order: 1,
  title: "Kubernetes workloads",
  description:
    "Pods, Deployments, and CrashLoopBackOff — systemd’s cousins, with a control loop.",
  durationMin: 40,
  objectives: [
    "Explain a Pod as one or more containers sharing a network namespace.",
    "Distinguish desired state (Deployment) from actual state (running Pods).",
    "Read CrashLoopBackOff as “the process exited and the supervisor is retrying,” not as a cluster outage.",
    "Use get → describe → logs before delete/restart.",
  ],
  skillIds: ["k8s.workloads", "k8s.architecture"],
  relatedIncidentIds: ["crashloop-backoff"],
  mentorContext:
    "Learner is on Kubernetes workloads. Map every object back to processes. Do not reveal the missing Secret.",
  sections: [
    {
      id: "objective",
      kind: "objective",
      title: "Objective",
      blocks: [
        {
          kind: "text",
          md: "A container is a process with isolation. A **Pod** is the Kubernetes object that *runs* those processes. A **Deployment** is the object that *wants* a number of them. CrashLoopBackOff is the kubelet spelling of `Restart=always` plus a crash.",
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
          md: "The control plane stores **desired state**. Controllers compare it to **actual state** and act.\n\n- You apply a Deployment: replicas=2, image=checkout:1.14.2\n- The Deployment controller creates a ReplicaSet\n- The ReplicaSet creates Pods\n- The scheduler binds each Pod to a node\n- The kubelet starts the containers (processes)\n\nIf a container exits non-zero, the kubelet restarts it. After a few fast failures the delay grows — **BackOff**. The cluster is not down. The process is.",
        },
      ],
    },
    {
      id: "visualization",
      kind: "visualization",
      title: "Control loop",
      blocks: [
        { kind: "visualization", visualization: "k8s-control-loop", caption: "Desired versus actual. Reconcile is a verb." },
      ],
    },
    {
      id: "explanation",
      kind: "explanation",
      title: "The investigation order",
      blocks: [
        {
          kind: "text",
          md: "1. `kubectl get pods` — is it Pending, Running, CrashLoopBackOff, ImagePullBackOff?\n2. `kubectl describe pod` — events: failed mount, missing secret, OOMKilled, unschedulable.\n3. `kubectl logs` — what the process itself said.\n\nRestarting the Pod (`delete`) without reading those three is the same mistake as `systemctl restart` on a bind failure.",
        },
        {
          kind: "example",
          title: "A missing secret looks like a crash",
          language: "text",
          code: "Warning  Failed  mount: secret \"checkout-db\" not found\nError:   DATABASE_URL is empty\nExit:    2",
          md: "The container may start, then exit. Events tell you about the missing object. Logs tell you about the empty env. Both are required.",
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
          runtimeId: "k8s-lab",
          title: "Read the workload",
          brief: "In namespace checkout, find the crashing pod and read its events. Do not delete it yet.",
          successDiscoveries: ["pod-crashing", "missing-secret"],
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
          md: "GPU inference pods CrashLoop for the same reasons: missing node selector, missing secret, wrong CUDA image. The objects change. The method does not. vLLM will later add metrics on top — it does not replace get/describe/logs.",
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
          title: "kubectl delete as a personality",
          md: "Deleting a crashing pod creates a new PID with the same missing secret. The backoff timer resets. You have manufactured activity and lost events.",
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
          id: "k8s-workloads-quiz",
          title: "Workloads",
          skillIds: ["k8s.workloads"],
          questions: [
            {
              id: "q1",
              prompt: "CrashLoopBackOff most precisely means:",
              options: [
                { id: "a", text: "The node is down.", explanation: "Then you would see NotReady, not a BackOff on a pod." },
                { id: "b", text: "The container process keeps exiting and the kubelet is delaying restarts.", explanation: "Correct." },
                { id: "c", text: "The Deployment object was deleted.", explanation: "Then pods would terminate, not loop." },
                { id: "d", text: "etcd is full.", explanation: "That is a control-plane incident, different symptoms." },
              ],
              correctOptionId: "b",
            },
            {
              id: "q2",
              prompt: "First three commands for a crashing pod?",
              options: [
                { id: "a", text: "delete, delete, rollout restart", explanation: "Treats the symptom." },
                { id: "b", text: "get, describe, logs", explanation: "Correct. State, events, process output." },
                { id: "c", text: "cordon, drain, reboot", explanation: "Node surgery is not the first move." },
                { id: "d", text: "helm uninstall", explanation: "Destroys evidence." },
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
          kind: "lab",
          id: "k8s-secret-lab",
          title: "Restore the secret and verify",
          brief: "Apply the runbook secret, wait until the pod is Running, and curl the in-cluster health endpoint.",
          runtimeId: "k8s-lab",
          successDiscoveries: ["secret-applied", "pod-running"],
          skillIds: ["k8s.workloads"],
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
          incidentId: "crashloop-backoff",
          title: "Northstar · checkout-api CrashLoopBackOff",
          md: "The same workload, on the company’s EKS cluster, after a “secret cleanup.”",
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
            { kind: "vendor", title: "Pods, Deployments, and container lifecycle", note: "Kubernetes documentation" },
            { kind: "cncf", title: "CNCF platform white paper — workload interfaces", note: "Conceptual" },
          ],
        },
      ],
    },
  ],
};
