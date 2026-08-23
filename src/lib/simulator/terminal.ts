import type { CommandResult, TerminalContext, TerminalRuntimeSpec } from "./types";

export function normalizeCommand(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function tokenize(raw: string): string[] {
  return normalizeCommand(raw).split(" ").filter(Boolean);
}

export function executeCommand(spec: TerminalRuntimeSpec, raw: string, state: TerminalContext["state"]): CommandResult {
  const normalized = normalizeCommand(raw);
  const args = tokenize(raw);
  const ctx: TerminalContext = { raw: normalized, args, state };

  if (!normalized) {
    return { stdout: "", stderr: "", exitCode: 0, discoveries: [] };
  }

  const exact = spec.commands.find((c) => !c.prefix && c.match === normalized);
  if (exact) return exact.run(ctx);

  const prefixed = spec.commands.find((c) => c.prefix && (normalized === c.match || normalized.startsWith(c.match + " ")));
  if (prefixed) return prefixed.run(ctx);

  if (spec.fallback) return spec.fallback(ctx);

  return {
    stdout: "",
    stderr: `bash: ${args[0]}: command not found`,
    exitCode: 127,
    discoveries: [],
  };
}

export function unknownLinux(ctx: TerminalContext): CommandResult {
  const cmd = ctx.args[0] ?? "";
  const known = [
    "ls",
    "cat",
    "ps",
    "top",
    "free",
    "df",
    "ss",
    "lsof",
    "systemctl",
    "journalctl",
    "curl",
    "kill",
    "dig",
    "kubectl",
    "aws",
    "nvidia-smi",
    "help",
  ];
  if (cmd === "help") {
    return {
      stdout: `Available in this environment:\n  ${known.slice(0, -1).join("\n  ")}\n\nThis is a mission-scoped simulation. Commands that are not relevant return a realistic error.`,
      stderr: "",
      exitCode: 0,
      discoveries: [],
    };
  }
  return {
    stdout: "",
    stderr: `bash: ${cmd}: command not found`,
    exitCode: 127,
    discoveries: [],
  };
}
