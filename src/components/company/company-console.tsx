"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NORTHSTAR } from "@content/company/northstar";
import { INCIDENTS } from "@content/incidents";
import { buttonVariants } from "@/components/ui/button";
import { companyStageFromIncidents } from "@/lib/skills/graph";
import { useProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/company", label: "Overview" },
  { href: "/company#tickets", label: "Tickets" },
  { href: "/company#incidents", label: "Incidents" },
  { href: "/company#systems", label: "Systems" },
  { href: "/company#runbooks", label: "Runbooks" },
];

export function CompanyFrame({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[oklch(0.15_0.012_250)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">{NORTHSTAR.name}</p>
          <p className="text-sm text-white/80">{eyebrow ?? "Operations"}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="size-1.5 rounded-full bg-sev" aria-hidden />
          <span className="text-white/60">PROD</span>
        </div>
      </div>
      <div className="grid flex-1 md:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 md:border-b-0 md:border-r">
          <nav className="flex flex-row gap-1 overflow-x-auto p-2 md:flex-col" aria-label="Company">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "rounded px-2 py-1.5 text-sm text-white/55 hover:bg-white/5 hover:text-white/90",
                  pathname === item.href && "bg-white/8 text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

export function CompanyOverview() {
  const joinCompany = useProgress((s) => s.joinCompany);
  const joined = useProgress((s) => s.joinedCompany);
  const resolved = useProgress((s) => s.resolvedIncidents);
  const stageMeta = companyStageFromIncidents(resolved);
  const stage = NORTHSTAR.stages.find((s) => s.id === stageMeta.id) ?? NORTHSTAR.stages[0];
  const assignment = INCIDENTS.find((i) => !resolved.includes(i.id)) ?? INCIDENTS.at(-1)!;

  return (
    <CompanyFrame eyebrow="Staff desk">
      <div className="space-y-6 text-white/85">
        <header>
          <h1 className="text-2xl font-medium text-white">You have joined {NORTHSTAR.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">{NORTHSTAR.about}</p>
          {!joined ? (
            <button type="button" className={cn(buttonVariants(), "mt-4")} onClick={() => joinCompany()}>
              Sign the on-call roster
            </button>
          ) : (
            <p className="mt-3 text-xs uppercase tracking-wide text-primary">
              Rostered · {stage.title} · {stage.role}
            </p>
          )}
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md bg-white/4 p-4 ring-1 ring-white/10">
            <p className="text-xs uppercase tracking-wide text-white/40">Current assignment</p>
            <h2 className="mt-2 text-lg text-white">{assignment.title}</h2>
            <p className="mt-2 text-sm text-white/55">{assignment.summary}</p>
            <Link href={`/company/incidents/${assignment.id}`} className={cn(buttonVariants(), "mt-4")}>
              Open incident
            </Link>
          </div>
          <div className="rounded-md bg-white/4 p-4 ring-1 ring-white/10">
            <p className="text-xs uppercase tracking-wide text-white/40">Stage</p>
            <h2 className="mt-2 text-lg text-white">{stage.title}</h2>
            <p className="mt-1 text-sm text-white/55">{stage.role}</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-white/55">
              {stage.infrastructure.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="incidents">
          <h2 className="text-sm font-medium text-white">Incidents</h2>
          <ul className="mt-2 divide-y divide-white/10 rounded-md ring-1 ring-white/10">
            {INCIDENTS.map((inc) => (
              <li key={inc.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                <Link href={`/company/incidents/${inc.id}`} className="text-white hover:underline">
                  {inc.severity} · {inc.title}
                  {inc.preview ? <span className="ml-2 text-xs text-white/40">advanced preview</span> : null}
                </Link>
                <span className="text-xs text-white/40">{resolved.includes(inc.id) ? "Resolved" : "Open"}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="tickets">
          <h2 className="text-sm font-medium text-white">Tickets</h2>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li>
              <Link href="/company/incidents/checkout-api-crash" className="hover:underline">
                PLAT-12 · checkout-api restart loop
              </Link>
            </li>
            <li>
              <Link href="/company/incidents/broken-dns" className="hover:underline">
                PLAT-40 · DNS cutover leftovers
              </Link>
            </li>
            <li>
              <Link href="/company/incidents/crashloop-backoff" className="hover:underline">
                PLAT-88 · secret hygiene regression
              </Link>
            </li>
            <li>
              <Link href="/company/incidents/inference-kv-cache" className="hover:underline">
                PLAT-201 · inference SLO
              </Link>
            </li>
          </ul>
        </section>

        <section id="systems">
          <h2 className="text-sm font-medium text-white">Systems</h2>
          <p className="mt-2 text-sm text-white/50">
            Terminal, journal, and host metrics are attached to each incident. A full AWS/K8s explorer ships with later stages.
          </p>
        </section>

        <section id="runbooks">
          <h2 className="text-sm font-medium text-white">Runbooks</h2>
          <p className="mt-2 text-sm text-white/50">
            Prefer method over runbook bingo: state → logs → process table → remediate → verify. Related lesson:{" "}
            <Link href="/learn/linux-os/processes" className="text-primary underline-offset-2 hover:underline">
              Linux Processes
            </Link>
            .
          </p>
        </section>
      </div>
    </CompanyFrame>
  );
}
