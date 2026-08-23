"use client";

import { useEffect, useRef, useState } from "react";
import { CornerDownLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { executeCommand } from "@/lib/simulator/terminal";
import type { TerminalRuntimeSpec } from "@/lib/simulator/types";
import { cn } from "@/lib/utils";

export interface TerminalEvent {
  command: string;
  discoveries: string[];
  effects?: Record<string, boolean | string | number>;
}

interface Line {
  kind: "in" | "out" | "err" | "sys";
  text: string;
}

export function SimTerminal({
  spec,
  initialState,
  onEvent,
  className,
}: {
  spec: TerminalRuntimeSpec;
  initialState?: Record<string, boolean | string | number>;
  onEvent?: (event: TerminalEvent) => void;
  className?: string;
}) {
  const [state, setState] = useState<Record<string, boolean | string | number>>(initialState ?? {});
  const [lines, setLines] = useState<Line[]>(() =>
    spec.motd ? [{ kind: "sys", text: spec.motd }] : [],
  );
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottom = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  function run(raw: string) {
    const command = raw.trim();
    if (!command) return;
    const result = executeCommand(spec, command, state);
    const next = result.effects ? { ...state, ...result.effects } : state;
    setState(next);
    setHistory((h) => [...h, command]);
    setHistIdx(-1);
    setLines((prev) => [
      ...prev,
      { kind: "in", text: `${spec.promptUser}@${spec.hostname}:${spec.cwd}$ ${command}` },
      ...(result.stdout ? result.stdout.split("\n").map((text) => ({ kind: "out" as const, text })) : []),
      ...(result.stderr ? result.stderr.split("\n").map((text) => ({ kind: "err" as const, text })) : []),
    ]);
    setInput("");
    onEvent?.({ command, discoveries: result.discoveries, effects: result.effects });
  }

  return (
    <div
      className={cn("terminal-screen flex h-[min(420px,62vh)] min-h-[300px] flex-col overflow-hidden rounded-xl ring-1 ring-white/10", className)}
      onClick={() => field.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[11px] text-white/50">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-red-300/50" />
          <span className="size-2 rounded-full bg-amber-200/50" />
          <span className="size-2 rounded-full bg-emerald-300/50" />
        </div>
        <span className="truncate">
          {spec.promptUser}@{spec.hostname} — simulated session
        </span>
        <button
          type="button"
          className="ml-auto rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
          aria-label="Clear terminal"
          onClick={(event) => {
            event.stopPropagation();
            setLines(spec.motd ? [{ kind: "sys", text: spec.motd }] : []);
            field.current?.focus();
          }}
        >
          <RotateCcw className="size-3" />
        </button>
      </div>
      <div className="flex-1 overflow-auto px-3 py-2 text-[12.5px] leading-5" role="log" aria-live="polite">
        {lines.map((line, i) => (
          <pre
            key={i}
            className={cn(
              "whitespace-pre-wrap font-mono",
              line.kind === "in" && "text-white/80",
              line.kind === "err" && "text-red-300/90",
              line.kind === "sys" && "text-white/45",
            )}
          >
            {line.text}
          </pre>
        ))}
        <div ref={bottom} />
      </div>
      <label className="sr-only" htmlFor={`term-${spec.id}`}>
        Terminal command
      </label>
      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2">
        <span className="shrink-0 text-[12px] text-white/40">
          {spec.promptUser}@{spec.hostname}$
        </span>
        <input
          id={`term-${spec.id}`}
          ref={field}
          value={input}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-white outline-none"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") run(input);
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const next = history.length ? Math.min(history.length - 1, histIdx + 1) : -1;
              if (next >= 0) {
                setHistIdx(next);
                setInput(history[history.length - 1 - next] ?? "");
              }
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = histIdx - 1;
              setHistIdx(next);
              setInput(next < 0 ? "" : (history[history.length - 1 - next] ?? ""));
            }
          }}
        />
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className="text-white/55 hover:bg-white/10 hover:text-white"
          disabled={!input.trim()}
          onClick={(event) => {
            event.stopPropagation();
            run(input);
          }}
        >
          Run
          <CornerDownLeft data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
