import { describe, expect, it } from "vitest";
import { brokenDnsIncident } from "@content/incidents/broken-dns";
import { checkoutIncident } from "@content/incidents/checkout-api-crash";
import { crashloopIncident } from "@content/incidents/crashloop-backoff";
import { inferenceIncident } from "@content/incidents/inference-kv-cache";
import { getRuntime } from "@content/runtimes";
import { IncidentIdentitySchema } from "@/lib/curriculum/schema";
import { evaluateIncident } from "./evaluate";
import { applyEffects, isResolved } from "./resolution";
import { executeCommand } from "./terminal";
import { mentorReply } from "@/lib/mentor/policy";

describe("incident schema", () => {
  it("validates authored incidents", () => {
    IncidentIdentitySchema.parse(checkoutIncident);
    IncidentIdentitySchema.parse(brokenDnsIncident);
    IncidentIdentitySchema.parse(crashloopIncident);
    IncidentIdentitySchema.parse(inferenceIncident);
  });
});

describe("checkout-api terminal", () => {
  it("does not reveal the root cause in status alone", () => {
    const spec = getRuntime("checkout-api");
    const status = executeCommand(spec, "systemctl status checkout-api", {});
    expect(status.discoveries).toContain("service-failed");
    expect(status.stdout.toLowerCase()).not.toContain("orphaned checkout-api process still holds");
  });

  it("restart without killing the orphan is a symptom treatment", () => {
    const spec = getRuntime("checkout-api");
    const restart = executeCommand(spec, "systemctl restart checkout-api", { orphanAlive: true });
    expect(restart.exitCode).toBe(1);
    expect(restart.discoveries).toContain("symptom-restart");
  });

  it("resolves only after kill, start, and verify", () => {
    const spec = getRuntime("checkout-api");
    let state: Record<string, boolean | string | number> = { orphanAlive: true, serviceActive: false };
    const discoveries = new Set<string>();

    const run = (cmd: string) => {
      const result = executeCommand(spec, cmd, state);
      state = applyEffects(state, result.effects);
      result.discoveries.forEach((d) => discoveries.add(d));
      return result;
    };

    run("systemctl status checkout-api");
    run("journalctl -u checkout-api");
    run("ss -lntp");
    expect(isResolved(checkoutIncident, state, [...discoveries])).toBe(false);
    run("kill 1842");
    run("systemctl start checkout-api");
    const health = run("curl localhost:8080/health");
    expect(health.stdout).toContain("ok");
    expect(isResolved(checkoutIncident, state, [...discoveries])).toBe(true);
  });
});

describe("evaluation", () => {
  it("penalizes hint-heavy unresolved work", () => {
    const weak = evaluateIncident(checkoutIncident, {
      incidentId: checkoutIncident.id,
      commands: ["systemctl restart checkout-api"],
      discoveries: [],
      hintsUsed: 4,
      symptomRestarts: 2,
      resolved: false,
      startedAt: new Date().toISOString(),
    });
    const strong = evaluateIncident(checkoutIncident, {
      incidentId: checkoutIncident.id,
      commands: [
        "systemctl status checkout-api",
        "journalctl -u checkout-api",
        "ss -lntp",
        "kill 1842",
        "systemctl start checkout-api",
        "curl localhost:8080/health",
      ],
      discoveries: ["service-failed", "address-in-use", "orphan-killed", "service-started", "verified-healthy"],
      hintsUsed: 0,
      symptomRestarts: 0,
      resolved: true,
      startedAt: new Date().toISOString(),
    });
    expect(strong.overall).toBeGreaterThan(weak.overall);
    expect(strong.remediation).toBe(1);
  });
});

describe("mentor policy", () => {
  it("does not name the orphan PID on a what's-wrong question", () => {
    const reply = mentorReply("what's wrong?", {
      mode: "socratic",
      hintLevel: 1,
      incidentId: "checkout-api-crash",
      discoveries: [],
      lastCommands: [],
    });
    expect(reply.toLowerCase()).not.toContain("1842");
    expect(reply.toLowerCase()).not.toContain("address already in use");
  });
});

describe("broken DNS", () => {
  it("resolves after removing the hosts pin", () => {
    const spec = getRuntime("dns-lab");
    let state: Record<string, boolean | string | number> = { hostsOverride: true };
    const discoveries = new Set<string>();
    const run = (cmd: string) => {
      const result = executeCommand(spec, cmd, state);
      state = applyEffects(state, result.effects);
      result.discoveries.forEach((d) => discoveries.add(d));
      return result;
    };
    run("getent hosts checkout.northstar.internal");
    run("dig @10.0.0.53 checkout.northstar.internal");
    expect(isResolved(brokenDnsIncident, state, [...discoveries])).toBe(false);
    run("sed -i '/checkout.northstar.internal/d' /etc/hosts");
    run("curl checkout.northstar.internal/health");
    expect(isResolved(brokenDnsIncident, state, [...discoveries])).toBe(true);
  });
});

describe("crashloop", () => {
  it("does not recover from delete-pod alone", () => {
    const spec = getRuntime("k8s-lab");
    const deleted = executeCommand(spec, "kubectl delete pod checkout-api-7d8f9c6b5-xk21", {
      secretPresent: false,
    });
    expect(deleted.discoveries).toContain("symptom-restart");
    let state: Record<string, boolean | string | number> = { secretPresent: false };
    const discoveries = new Set<string>();
    const run = (cmd: string) => {
      const result = executeCommand(spec, cmd, state);
      state = applyEffects(state, result.effects);
      result.discoveries.forEach((d) => discoveries.add(d));
    };
    run("kubectl get pods -n checkout");
    run("kubectl describe pod checkout-api-7d8f9c6b5-xk21 -n checkout");
    run("kubectl apply -f /opt/runbooks/checkout-secret.yaml");
    run("kubectl get pods -n checkout");
    run("curl checkout-api.checkout.svc/health");
    expect(isResolved(crashloopIncident, state, [...discoveries])).toBe(true);
  });
});

describe("inference preview", () => {
  it("exposes cache and queue without stating the essay-length answer", () => {
    const spec = getRuntime("inference-preview");
    const metrics = executeCommand(spec, "curl localhost:8000/metrics", {});
    expect(metrics.discoveries).toContain("kv-cache-saturated");
    expect(metrics.stdout).toContain("0.94");
    expect(metrics.stdout.includes("Raising max-model-len")).toBe(false);
  });
});
