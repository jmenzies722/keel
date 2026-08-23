"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProcState = "absent" | "R" | "S" | "Z" | "dead";

interface Proc {
  pid: number;
  ppid: number;
  name: string;
  state: ProcState;
}

const STEPS = [
  "Parent exists (PID 904, worker.py, sleeping on I/O).",
  "fork() — child 941 is a copy. Both exist.",
  "exec() — child becomes burn.py and enters R.",
  "Child burns CPU (R). Parent still S.",
  "SIGTERM to 941 — process handles it and exits. Becomes Z until wait().",
  "Parent wait() — zombie is reaped. Only the parent remains.",
];

export function ProcessLifecycle() {
  const [step, setStep] = useState(0);

  const parent: Proc = { pid: 904, ppid: 1, name: "worker.py", state: "S" };
  const child: Proc = {
    pid: 941,
    ppid: 904,
    name: step < 2 ? "worker.py" : "burn.py",
    state: step < 1 ? "absent" : step < 4 ? "R" : step === 4 ? "Z" : "dead",
  };

  return (
    <div className="rounded-lg ring-1 ring-foreground/10">
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_220px]">
        <div className="relative min-h-[220px] rounded-md bg-muted/40 p-4">
          <ProcessCard proc={parent} accent="parent" />
          {child.state !== "absent" && child.state !== "dead" ? (
            <>
              <svg className="pointer-events-none absolute left-[72px] top-[86px] h-10 w-8" aria-hidden>
                <line x1="16" y1="0" x2="16" y2="40" className="stroke-foreground/30" strokeWidth="1.5" />
              </svg>
              <div className="ml-10 mt-8">
                <ProcessCard proc={child} accent="child" />
              </div>
            </>
          ) : (
            <p className="mt-10 text-xs text-muted-foreground">
              {step === 0 ? "No child yet. The parent can fork." : "Child has been reaped. The PID is free."}
            </p>
          )}
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Step {step + 1} / {STEPS.length}</p>
          <p>{STEPS[step]}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Previous
            </Button>
            <Button size="sm" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>
              Next
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setStep(0)}>
              Reset
            </Button>
          </div>
        </div>
      </div>
      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        R = runnable · S = interruptible sleep · Z = zombie (exited, not waited). Signals act on a PID, not on a unit name.
      </div>
    </div>
  );
}

function ProcessCard({ proc, accent }: { proc: Proc; accent: "parent" | "child" }) {
  return (
    <div
      className={cn(
        "w-[220px] rounded-md border bg-card px-3 py-2 text-sm shadow-sm",
        accent === "child" && proc.state === "R" && "border-primary/40",
        proc.state === "Z" && "border-warn/50 opacity-80",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">PID {proc.pid}</span>
        <StatePill state={proc.state} />
      </div>
      <p className="mt-1 font-medium">{proc.name}</p>
      <p className="font-mono text-[11px] text-muted-foreground">PPID {proc.ppid}</p>
    </div>
  );
}

function StatePill({ state }: { state: ProcState }) {
  const label = state === "absent" || state === "dead" ? "—" : state;
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-[10px]",
        state === "R" && "bg-primary/15 text-primary",
        state === "S" && "bg-muted text-muted-foreground",
        state === "Z" && "bg-warn/15 text-warn",
      )}
    >
      {label}
    </span>
  );
}
