import type { Lesson } from "@/lib/curriculum/types";

export const processesLesson: Lesson = {
  id: "linux-os/processes",
  slug: "processes",
  phaseSlug: "linux-os",
  moduleSlug: "processes",
  order: 1,
  title: "Linux Processes",
  description:
    "The process model, states, signals, and systemd supervision — the mental model behind every “the service is down” page.",
  durationMin: 45,
  objectives: [
    "Explain a process as an address space plus a schedulable thread of execution, identified by a PID.",
    "Read process state (R, S, D, Z, T) and a parent/child tree.",
    "Choose SIGTERM before SIGKILL, and say what each one actually does.",
    "Use systemctl and journalctl as views onto a supervised process, not as magic verbs.",
    "Investigate a misbehaving process on a host without guessing.",
  ],
  skillIds: ["linux.processes", "linux.cli"],
  relatedIncidentIds: ["checkout-api-crash"],
  mentorContext:
    "Learner is on Linux Processes. Prefer Socratic questions. Do not reveal the company incident root cause. Point at systemctl, ps, journalctl, and the difference between a unit and a PID.",
  sections: [
    {
      id: "objective",
      kind: "objective",
      title: "Objective",
      blocks: [
        {
          kind: "text",
          md: "By the end of this lesson you will treat a failing service as a **supervised process**, not as a black box named after the product. You will be able to answer: what PID is running, who is its parent, what state is it in, which signals it has seen, and whether systemd’s view of the world matches the process table.",
        },
        {
          kind: "callout",
          variant: "insight",
          title: "Why this lesson exists here",
          md: "Containers, Kubernetes pods, GPU workers, and vLLM replicas are all processes under a supervisor. If the process model is fuzzy, every later incident becomes folklore.",
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
          md: "A **process** is the kernel’s bookkeeping for a running program: a PID, a parent PID, an address space (memory), open file descriptors, credentials, and one or more threads the scheduler can run.\n\nThree objects get confused in production:\n\n- the **binary** on disk (`/usr/local/bin/checkout-api`)\n- the **process** in the table (PID 1842, state S)\n- the **unit** systemd is supervising (`checkout-api.service`)\n\nThey are related. They are not the same. A unit can be `failed` while a process still holds a port. A process can be `Z` (zombie) after it has already exited, waiting for its parent to `wait()`.",
        },
        {
          kind: "callout",
          variant: "info",
          title: "PID 1",
          md: "On a Linux host, PID 1 is the init process — systemd, in almost every environment you will operate. It is the ancestor of user services and the process that reaps orphans. Killing it is not a troubleshooting step.",
        },
      ],
    },
    {
      id: "explanation",
      kind: "explanation",
      title: "How a process comes to exist",
      blocks: [
        {
          kind: "text",
          md: "New processes are created with `fork` (or `clone`). The child starts as a copy of the parent, then typically `exec`s a new image. That is why `ps -ef` is more useful than a flat list: **PPID tells you who is responsible**.\n\nAfter exec, the process lives in a small set of states you will actually see:\n\n- **R** runnable (running or waiting for CPU)\n- **S** interruptible sleep (waiting for an event — most daemons look like this)\n- **D** uninterruptible sleep (often disk; signals will not help)\n- **T** stopped (job control / SIGSTOP)\n- **Z** zombie (exited, not yet waited)\n\n`top` and `ps` show these letters in the `STAT` column. A trailing `<` or `+` is extra; the first letter is the one that matters.",
        },
        {
          kind: "example",
          title: "Reading one line of ps",
          language: "text",
          code: "app  941  98.7  2.8  411204  112440  ?  R  10:04  41:17  python3 /tmp/burn.py",
          md: "User `app`, PID 941, nearly a full core, ~110 MiB resident, **state R**, started 10:04, 41 minutes of CPU time. That is a runaway compute loop, not a sleeping daemon.",
        },
      ],
    },
    {
      id: "visualization",
      kind: "visualization",
      title: "Process lifecycle",
      blocks: [
        {
          kind: "text",
          md: "Step through a parent forking a child, the child running, sleeping, and what happens when the parent does — or does not — wait. Then send signals and watch the state change.",
        },
        {
          kind: "visualization",
          visualization: "process-lifecycle",
          caption: "Fork, exec, states, and signals — one process family.",
        },
      ],
    },
    {
      id: "signals",
      kind: "explanation",
      title: "Signals are the API",
      blocks: [
        {
          kind: "text",
          md: "User space does not “stop a process” by wishing. It delivers a **signal**.\n\n- `SIGTERM` (15) — polite request. The process may flush, close sockets, and exit.\n- `SIGINT` (2) — what Ctrl+C sends to a foreground process.\n- `SIGHUP` (1) — historically “terminal hung up”; many daemons reload config.\n- `SIGKILL` (9) — unblockable. The kernel tears the process down. No cleanup.\n\n**Default operational order:** SIGTERM, wait, then SIGKILL. systemd’s `TimeoutStopSec` is exactly this policy. If the timeout is short and the app drains slowly, you get a killed main PID and whatever it did not have time to leave behind — including listen sockets in some designs.",
        },
        {
          kind: "callout",
          variant: "failure",
          title: "Failure mode",
          md: "`kill -9` on a production API because it was “stuck” skips drain. Connections reset. In-flight writes abort. Leftover children or file locks become the next incident. SIGKILL is a last resort, not a personality.",
        },
      ],
    },
    {
      id: "systemd",
      kind: "explanation",
      title: "systemd is a supervisor",
      blocks: [
        {
          kind: "text",
          md: "A `.service` unit describes **how to start, stop, and restart a process**. Useful fields:\n\n- `ExecStart=` — the command that becomes the main process\n- `Restart=always` — restart on any exit, including a config error\n- `RestartSec=` — how hard you are willing to stampede\n- `TimeoutStopSec=` — how long SIGTERM is allowed to work\n- `KillMode=` — whether children die with the main PID\n\n`systemctl status` is systemd’s opinion. `ps` is the kernel’s opinion. When they disagree, believe both and reconcile — that disagreement *is* the incident.",
        },
        {
          kind: "example",
          title: "A tight stop timeout",
          language: "text",
          code: `[Service]\nExecStart=/usr/local/bin/checkout-api\nRestart=always\nRestartSec=5\nTimeoutStopSec=7`,
          md: "If the API needs 20 seconds to drain, this unit will SIGKILL it. The next start may collide with whatever the kill did not clean up.",
        },
      ],
    },
    {
      id: "example",
      kind: "example",
      title: "Worked example",
      blocks: [
        {
          kind: "text",
          md: "A worker unit is “up” according to systemd but the box load average is 1.2 on a single-core lab VM. Method:\n\n1. `systemctl status worker` — is the unit actually active?\n2. `ps -ef` — which child is burning CPU, and who is the parent?\n3. `cat /proc/<pid>/status` — confirm state and PPID.\n4. `kill -15 <pid>` — ask it to exit.\n5. Re-check `ps`. If it remains in R, *then* consider SIGKILL and a bug report.\n\nYou are not “restarting the server”. You are applying the process model.",
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
          runtimeId: "linux-explore",
          title: "Read the process table",
          brief: "On lab-01, find the process consuming nearly a full core. Note its PID and parent. You do not have to stop it yet.",
          successDiscoveries: ["runaway-visible", "process-table"],
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
          md: "Every later layer reuses this model:\n\n- **Containers** are processes with namespaces and cgroups.\n- **Pods** are groups of containers with a pause process and a kubelet that acts like a remote systemd.\n- **vLLM** is a process that holds GPU memory. Killing it drops the KV cache. Restarting it does not create free KV blocks if the flags still reserve them.\n\nWhen an on-call doc says “restart the pod”, you should hear “send the container a termination signal, wait for the grace period, then SIGKILL, then start a new PID.” That translation is this lesson.",
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
          variant: "warning",
          title: "Restart storms",
          md: "`Restart=always` plus a start-up error (bad bind, missing env, crashed constructor) produces a tight loop. CPU looks busy. Logs repeat. The unit never stays `active`. The fix is not a faster restart. The fix is the condition that makes `ExecStart` exit.",
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
          id: "linux-processes-quiz",
          title: "Process model",
          skillIds: ["linux.processes"],
          questions: [
            {
              id: "q1",
              prompt: "systemd reports checkout-api.service as failed, but ss shows a process listening on :8080. What is the most accurate statement?",
              options: [
                {
                  id: "a",
                  text: "The unit and the process are the same object; ss must be stale.",
                  explanation: "They are different objects. systemd can lose track of a PID that left its cgroup.",
                },
                {
                  id: "b",
                  text: "A process can still hold the port after the unit has given up on its main PID.",
                  explanation: "Correct. This is the usual leftover-socket / orphan shape.",
                },
                {
                  id: "c",
                  text: "You should reboot. PID tables cannot disagree with systemd.",
                  explanation: "They can and do disagree. Reboot hides the lesson and the bug.",
                },
                {
                  id: "d",
                  text: "The listen socket lives in the unit file, not in a process.",
                  explanation: "Sockets are held by processes (file descriptors), not by unit text.",
                },
              ],
              correctOptionId: "b",
            },
            {
              id: "q2",
              prompt: "A process is in state D. You send SIGTERM, then SIGKILL. Nothing changes. Why?",
              options: [
                {
                  id: "a",
                  text: "State D is uninterruptible sleep, usually in a kernel path (often I/O). Signals are not delivered until it leaves that path.",
                  explanation: "Correct. Look at disk, NFS, or a wedged device — not at kill -9 volume.",
                },
                {
                  id: "b",
                  text: "SIGKILL is blocked by the application’s signal handler.",
                  explanation: "SIGKILL cannot be caught. That is not the issue here.",
                },
                {
                  id: "c",
                  text: "State D means zombie; only the parent can clear it.",
                  explanation: "Zombie is Z, not D.",
                },
                {
                  id: "d",
                  text: "You need to systemctl daemon-reload first.",
                  explanation: "Unrelated to a kernel uninterruptible sleep.",
                },
              ],
              correctOptionId: "a",
            },
            {
              id: "q3",
              prompt: "Which command is the right first instrument for “the systemd service is down”?",
              options: [
                {
                  id: "a",
                  text: "reboot",
                  explanation: "Destroys evidence.",
                },
                {
                  id: "b",
                  text: "systemctl status <unit> then journalctl -u <unit>",
                  explanation: "Correct. Current state, then the unit’s log, then the process table if they disagree.",
                },
                {
                  id: "c",
                  text: "kill -9 1",
                  explanation: "That is PID 1.",
                },
                {
                  id: "d",
                  text: "docker system prune",
                  explanation: "Not a Linux process investigation.",
                },
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
          id: "linux-runaway-lab",
          title: "Stop the runaway worker",
          brief: "A child of /opt/lab/worker.py is burning a core. Confirm PID and PPID, then stop the child with SIGTERM. Do not kill PID 1. Do not start with SIGKILL.",
          runtimeId: "linux-lab",
          successDiscoveries: ["runaway-pid", "signal-sent"],
          skillIds: ["linux.processes", "linux.cli"],
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
          incidentId: "checkout-api-crash",
          title: "Northstar · SEV-2 checkout-api restart loop",
          md: "The same model, without a narrator. A production unit is restarting. systemd and the process table will disagree. You will not be told why.",
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
            { kind: "man", title: "proc(5) — process information", note: "Linux man-pages" },
            { kind: "man", title: "signal(7) — signal dispositions", note: "Linux man-pages" },
            { kind: "man", title: "fork(2), execve(2), wait(2)", note: "Linux man-pages" },
            { kind: "man", title: "systemd.service(5)", note: "systemd documentation" },
            {
              kind: "standard",
              title: "CS2023 — Operating Systems (OS) knowledge area",
              note: "ACM / IEEE-CS / AAAI",
            },
          ],
        },
      ],
    },
  ],
};
