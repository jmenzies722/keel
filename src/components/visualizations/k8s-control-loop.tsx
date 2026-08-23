"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function K8sControlLoop() {
  const [desired, setDesired] = useState(2);
  const [actual, setActual] = useState(1);
  const [secret, setSecret] = useState(false);

  const running = secret ? Math.min(actual, desired) : 0;
  const crashing = secret ? 0 : actual;

  return (
    <div className="space-y-4 rounded-lg p-4 ring-1 ring-foreground/10">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md bg-muted/40 p-3">
          <p className="text-xs uppercase text-muted-foreground">Desired</p>
          <p className="font-mono text-2xl">{desired}</p>
          <p className="text-xs text-muted-foreground">Deployment.spec.replicas</p>
        </div>
        <div className="rounded-md bg-muted/40 p-3">
          <p className="text-xs uppercase text-muted-foreground">Actual Running</p>
          <p className="font-mono text-2xl">{running}</p>
          <p className="text-xs text-muted-foreground">Pods Ready 1/1</p>
        </div>
        <div className="rounded-md bg-muted/40 p-3">
          <p className="text-xs uppercase text-muted-foreground">CrashLoop</p>
          <p className="font-mono text-2xl">{crashing}</p>
          <p className="text-xs text-muted-foreground">Secret present: {secret ? "yes" : "no"}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Reconcile creates pods to match desired. If the secret is missing, actual count can be “2” and still zero Ready.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setDesired((n) => Math.min(5, n + 1))}>
          Scale +1
        </Button>
        <Button size="sm" variant="outline" onClick={() => setActual(desired)}>
          Reconcile
        </Button>
        <Button size="sm" onClick={() => setSecret(true)}>
          Restore secret
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setDesired(2); setActual(1); setSecret(false); }}>
          Reset
        </Button>
      </div>
    </div>
  );
}
