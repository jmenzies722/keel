"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { title: "Stub", body: "libc / getent asks the configured resolver. It also checks /etc/hosts first (nsswitch)." },
  { title: "Hosts file", body: "If the name is pinned here, DNS is never consulted. This is the usual “dig is fine” trap." },
  { title: "Recursive resolver", body: "Cache hit returns immediately. Otherwise walk root → TLD → authoritative." },
  { title: "Authoritative", body: "Owns the zone. Returns A/AAAA, CNAME, or NXDOMAIN — not “the site is down.”" },
];

export function DnsResolution() {
  const [step, setStep] = useState(0);
  return (
    <div className="rounded-lg p-4 ring-1 ring-foreground/10">
      <ol className="grid gap-2 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className={`rounded-md p-3 text-sm ring-1 ${i === step ? "ring-primary/40 bg-accent" : "ring-foreground/10"}`}
          >
            <p className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
            <p className="font-medium">{s.title}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted-foreground">{STEPS[step].body}</p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Previous
        </Button>
        <Button size="sm" disabled={step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
