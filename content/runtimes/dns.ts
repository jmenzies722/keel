import { unknownLinux } from "@/lib/simulator/terminal";
import type { CommandResult, TerminalContext, TerminalRuntimeSpec } from "@/lib/simulator/types";

function hostsFile(ctx: TerminalContext): string {
  const override = ctx.state.hostsOverride !== false;
  return `127.0.0.1 localhost
10.0.1.9 checkout.northstar.internal${override ? "" : "\n# override removed"}
10.0.0.53 ns1.northstar.internal`;
}

function getent(ctx: TerminalContext): CommandResult {
  if (ctx.state.hostsOverride !== false) {
    return {
      stdout: "10.0.1.9        checkout.northstar.internal",
      stderr: "",
      exitCode: 0,
      discoveries: ["hosts-override", "stub-old"],
    };
  }
  return {
    stdout: "10.0.4.12       checkout.northstar.internal",
    stderr: "",
    exitCode: 0,
    discoveries: ["resolution-agrees"],
  };
}

export const dnsRuntime: TerminalRuntimeSpec = {
  id: "dns-lab",
  hostname: "edge-01",
  promptUser: "oncall",
  cwd: "~",
  motd: "Northstar edge · resolver comparison lab. Type `help`.",
  commands: [
    { match: "getent hosts checkout.northstar.internal", run: getent },
    { match: "getent hosts checkout.northstar.internal.", run: getent },
    {
      match: "dig checkout.northstar.internal",
      run: (ctx) =>
        ctx.state.hostsOverride !== false
          ? {
              stdout: `; <<>> DiG <<>> checkout.northstar.internal
;; ->>HEADER<<- opcode: QUERY, status: NOERROR
;; ANSWER: checkout.northstar.internal. 30 IN A 10.0.4.12
;; SERVER: 10.0.0.53#53`,
              stderr: "",
              exitCode: 0,
              discoveries: ["auth-record"],
            }
          : {
              stdout: `; <<>> DiG <<>> checkout.northstar.internal
;; ->>HEADER<<- opcode: QUERY, status: NOERROR
;; ANSWER: checkout.northstar.internal. 30 IN A 10.0.4.12
;; SERVER: 10.0.0.53#53`,
              stderr: "",
              exitCode: 0,
              discoveries: ["auth-record", "resolution-agrees"],
            },
    },
    {
      match: "dig @10.0.0.53 checkout.northstar.internal",
      run: () => ({
        stdout: `; <<>> DiG 9.18 <<>> @10.0.0.53 checkout.northstar.internal
; (1 server found)
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 44120
;; ANSWER SECTION:
checkout.northstar.internal. 30 IN A 10.0.4.12`,
        stderr: "",
        exitCode: 0,
        discoveries: ["auth-record"],
      }),
    },
    {
      match: "dig +short @10.0.0.53 checkout.northstar.internal",
      run: () => ({
        stdout: "10.0.4.12",
        stderr: "",
        exitCode: 0,
        discoveries: ["auth-record"],
      }),
    },
    {
      match: "cat /etc/hosts",
      run: (ctx) => ({
        stdout: hostsFile(ctx),
        stderr: "",
        exitCode: 0,
        discoveries: ctx.state.hostsOverride !== false ? ["hosts-override"] : ["hosts-cleared"],
      }),
    },
    {
      match: "sed -i '/checkout.northstar.internal/d' /etc/hosts",
      run: () => ({
        stdout: "",
        stderr: "",
        exitCode: 0,
        discoveries: ["hosts-cleared"],
        effects: { hostsOverride: false },
      }),
    },
    {
      match: "sudo sed -i '/checkout.northstar.internal/d' /etc/hosts",
      run: () => ({
        stdout: "",
        stderr: "",
        exitCode: 0,
        discoveries: ["hosts-cleared"],
        effects: { hostsOverride: false },
      }),
    },
    {
      match: "curl checkout.northstar.internal/health",
      run: (ctx) =>
        ctx.state.hostsOverride !== false
          ? {
              stdout: "",
              stderr: "curl: (7) Failed to connect to 10.0.1.9 port 80: No route to host",
              exitCode: 7,
              discoveries: ["old-ip-dead"],
            }
          : {
              stdout: `{"status":"ok","service":"checkout-api","via":"10.0.4.12"}`,
              stderr: "",
              exitCode: 0,
              discoveries: ["resolution-agrees", "verified-healthy"],
            },
    },
    {
      match: "curl -s checkout.northstar.internal/health",
      run: (ctx) => dnsRuntime.commands.find((c) => c.match === "curl checkout.northstar.internal/health")!.run(ctx),
    },
    {
      match: "ping -c 1 checkout.northstar.internal",
      run: (ctx) =>
        ctx.state.hostsOverride !== false
          ? {
              stdout: "PING checkout.northstar.internal (10.0.1.9) 56(84) bytes of data.\nFrom 10.0.0.1 icmp_seq=1 Destination Host Unreachable",
              stderr: "",
              exitCode: 1,
              discoveries: ["old-ip-dead"],
            }
          : {
              stdout: "PING checkout.northstar.internal (10.0.4.12) 56(84) bytes of data.\n64 bytes from 10.0.4.12: icmp_seq=1 ttl=63 time=0.7 ms",
              stderr: "",
              exitCode: 0,
              discoveries: ["resolution-agrees"],
            },
    },
  ],
  fallback: unknownLinux,
};
