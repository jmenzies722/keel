import { unknownLinux } from "@/lib/simulator/terminal";
import type { CommandResult, TerminalContext, TerminalRuntimeSpec } from "@/lib/simulator/types";

function pods(ctx: TerminalContext): CommandResult {
  const running = ctx.state.secretPresent === true;
  return {
    stdout: running
      ? `NAME                            READY   STATUS    RESTARTS   AGE
checkout-api-7d8f9c6b5-xk21     1/1     Running   7          41m
checkout-db-0                   1/1     Running   0          12d`
      : `NAME                            READY   STATUS             RESTARTS   AGE
checkout-api-7d8f9c6b5-xk21     0/1     CrashLoopBackOff   7          41m
checkout-db-0                   1/1     Running            0          12d`,
    stderr: "",
    exitCode: 0,
    discoveries: running ? ["pod-running"] : ["pod-crashing"],
  };
}

function describe(ctx: TerminalContext): CommandResult {
  if (ctx.state.secretPresent === true) {
    return {
      stdout: `Name:         checkout-api-7d8f9c6b5-xk21
Namespace:    checkout
Status:       Running
Containers:
  api:
    Environment: DATABASE_URL from secret checkout-db
Events:
  SuccessfulMountVolume  secret/checkout-db
  Started                container api`,
      stderr: "",
      exitCode: 0,
      discoveries: ["pod-running"],
    };
  }
  return {
    stdout: `Name:         checkout-api-7d8f9c6b5-xk21
Namespace:    checkout
Status:       CrashLoopBackOff
Containers:
  api:
    Last State: Terminated  Exit 2  Reason: Error
    Environment: envFrom secretRef checkout-db
Events:
  Warning  Failed  spec.containers{api}: Error: secret "checkout-db" not found
  Warning  BackOff Back-off restarting failed container api`,
    stderr: "",
    exitCode: 0,
    discoveries: ["pod-crashing", "missing-secret"],
  };
}

function logs(ctx: TerminalContext): CommandResult {
  if (ctx.state.secretPresent === true) {
    return {
      stdout: `{"level":"info","msg":"listening","addr":":8080"}`,
      stderr: "",
      exitCode: 0,
      discoveries: ["pod-running"],
    };
  }
  return {
    stdout: `error: DATABASE_URL is empty or unset
checkout.db.connect() failed: missing DSN
exit 2`,
    stderr: "",
    exitCode: 0,
    discoveries: ["empty-env"],
  };
}

export const k8sRuntime: TerminalRuntimeSpec = {
  id: "k8s-lab",
  hostname: "bastion",
  promptUser: "platform",
  cwd: "~",
  motd: "Northstar · kube-context prod-eks · namespace checkout. Type `help`.",
  commands: [
    { match: "kubectl get pods", run: pods },
    { match: "kubectl get pods -n checkout", run: pods },
    { match: "kubectl get po -n checkout", run: pods },
    { match: "kubectl describe pod checkout-api-7d8f9c6b5-xk21", run: describe },
    { match: "kubectl describe pod checkout-api-7d8f9c6b5-xk21 -n checkout", run: describe },
    { match: "kubectl describe pod", prefix: true, run: describe },
    { match: "kubectl logs checkout-api-7d8f9c6b5-xk21", run: logs },
    { match: "kubectl logs checkout-api-7d8f9c6b5-xk21 -n checkout", run: logs },
    { match: "kubectl logs", prefix: true, run: logs },
    {
      match: "kubectl get secret",
      prefix: true,
      run: (ctx) => ({
        stdout:
          ctx.state.secretPresent === true
            ? `NAME          TYPE     DATA   AGE
checkout-db   Opaque   1      2m`
            : `No resources found in checkout namespace.`,
        stderr: "",
        exitCode: 0,
        discoveries: ctx.state.secretPresent === true ? ["secret-applied"] : ["secret-missing-list"],
      }),
    },
    {
      match: "kubectl apply -f /opt/runbooks/checkout-secret.yaml",
      run: () => ({
        stdout: "secret/checkout-db created",
        stderr: "",
        exitCode: 0,
        discoveries: ["secret-applied"],
        effects: { secretPresent: true },
      }),
    },
    {
      match: "kubectl apply -f /opt/runbooks/checkout-secret.yaml -n checkout",
      run: () => ({
        stdout: "secret/checkout-db created",
        stderr: "",
        exitCode: 0,
        discoveries: ["secret-applied"],
        effects: { secretPresent: true },
      }),
    },
    {
      match: "kubectl delete pod checkout-api-7d8f9c6b5-xk21",
      run: (ctx) => ({
        stdout: "pod \"checkout-api-7d8f9c6b5-xk21\" deleted",
        stderr: "",
        exitCode: 0,
        discoveries: ["symptom-restart"],
        effects: ctx.state.secretPresent === true ? {} : { secretPresent: false },
      }),
    },
    {
      match: "kubectl rollout status deploy/checkout-api",
      run: (ctx) =>
        ctx.state.secretPresent === true
          ? {
              stdout: "deployment \"checkout-api\" successfully rolled out",
              stderr: "",
              exitCode: 0,
              discoveries: ["pod-running", "verified-healthy"],
            }
          : {
              stdout: "Waiting for deployment \"checkout-api\" rollout to finish: 0 of 1 updated replicas are available...",
              stderr: "",
              exitCode: 1,
              discoveries: ["pod-crashing"],
            },
    },
    {
      match: "curl checkout-api.checkout.svc/health",
      run: (ctx) =>
        ctx.state.secretPresent === true
          ? {
              stdout: `{"status":"ok","service":"checkout-api"}`,
              stderr: "",
              exitCode: 0,
              discoveries: ["verified-healthy", "pod-running"],
            }
          : {
              stdout: "",
              stderr: "curl: (7) Failed to connect to checkout-api.checkout.svc port 80: Connection refused",
              exitCode: 7,
              discoveries: [],
            },
    },
  ],
  fallback: unknownLinux,
};
