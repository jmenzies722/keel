"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function KvCache() {
  const [reserved, setReserved] = useState(94);
  const waiting = reserved > 85 ? Math.round((reserved - 70) * 140) : 12;
  const sm = reserved > 85 ? 38 : 81;

  return (
    <div className="space-y-4 rounded-lg p-4 ring-1 ring-foreground/10">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="KV cache" value={`${reserved}%`} />
        <Metric label="Waiting" value={String(waiting)} />
        <Metric label="SM util" value={`${sm}%`} />
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label="KV cache occupancy">
        <div className="h-full bg-primary" style={{ width: `${reserved}%` }} />
      </div>
      <p className="text-sm text-muted-foreground">
        {reserved > 85
          ? "Almost no free blocks. New sequences wait. Compute looks idle."
          : "Headroom exists. Continuous batching can admit work."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setReserved((n) => Math.min(99, n + 4))}>
          Raise max-model-len
        </Button>
        <Button size="sm" onClick={() => setReserved(62)}>
          Recover headroom
        </Button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="font-mono text-2xl">{value}</p>
    </div>
  );
}
