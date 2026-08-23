"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { PHASES } from "@content/curriculum/phases";
import { AUTHORED_PATH } from "@content/path";
import { lessonsForPhase } from "@content/curriculum/index";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TRACKS, type PhaseMeta } from "@/lib/curriculum/types";
import { useDerivedProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

type Filter = "all" | "available" | "catalog";

export function RoadmapView() {
  const { progress } = useDerivedProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visible = PHASES.filter((phase) => {
    const statusMatch =
      filter === "all" ||
      (filter === "available" && phase.status !== "catalog") ||
      (filter === "catalog" && phase.status === "catalog");
    const queryMatch =
      !normalizedQuery ||
      phase.title.toLowerCase().includes(normalizedQuery) ||
      phase.tagline.toLowerCase().includes(normalizedQuery) ||
      phase.modules.some((module) => module.title.toLowerCase().includes(normalizedQuery));
    return statusMatch && queryMatch;
  });

  return (
    <div className="space-y-10">
      <header className="border-b border-border/70 pb-7">
        <Badge variant="outline" className="mb-3">42-phase catalog</Badge>
        <h1 className="text-4xl font-medium tracking-[-0.03em]">Roadmap</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Forty-two phases from computing foundations to staff-level AI platform engineering. Catalog nodes describe the path. Authored nodes can be entered.
        </p>
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Search roadmap</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search phases, modules, or systems…"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <div className="flex gap-2" aria-label="Roadmap filters">
            {([
              ["all", "All"],
              ["available", "Authored"],
              ["catalog", "Catalog"],
            ] as const).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={filter === value ? "default" : "outline"}
                onClick={() => setFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <nav aria-label="Roadmap tracks" className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {TRACKS.map((track) => (
            <a
              key={track.id}
              href={`#${track.id}`}
              className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {track.title}
            </a>
          ))}
        </nav>
      </header>
      {TRACKS.map((track) => {
        const phases = visible.filter((p) => p.track === track.id);
        if (phases.length === 0) return null;
        return (
          <section key={track.id} id={track.id} className="scroll-mt-24 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
              <h2 className="text-lg font-medium">{track.title}</h2>
              <p className="text-sm text-muted-foreground">{track.blurb}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{phases.length} phases</span>
            </div>
            <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {phases.map((phase) => (
                <PhaseCard key={phase.id} phase={phase} skillLevel={bestLevel(phase, progress)} />
              ))}
            </ol>
          </section>
        );
      })}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No phases match that search.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a system name like Linux, DNS, Kubernetes, or serving.</p>
          <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => { setQuery(""); setFilter("all"); }}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function bestLevel(phase: PhaseMeta, progress: ReturnType<typeof useDerivedProgress>["progress"]) {
  const levels = phase.skills.map((id) => progress[id]?.level ?? 0);
  return levels.length ? Math.max(...levels) : 0;
}

function PhaseCard({ phase, skillLevel }: { phase: PhaseMeta; skillLevel: number }) {
  const authored = lessonsForPhase(phase.slug)[0];
  const pathHit = AUTHORED_PATH.find((n) => n.lesson.startsWith(`${phase.slug}/`));
  const href = authored
    ? `/learn/${authored.phaseSlug}/${authored.slug}`
    : pathHit
      ? `/learn/${pathHit.lesson}`
      : `/learn/${phase.slug}`;

  return (
    <li id={phase.slug}>
      <Link
        href={href}
        className={cn(
          "group block h-full rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:bg-muted/30 hover:shadow-md",
          phase.status === "available" && "ring-primary/25",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-xs text-muted-foreground">{String(phase.order).padStart(2, "0")}</span>
          <Status status={phase.status} />
        </div>
        <h3 className="mt-2 font-medium transition-colors group-hover:text-primary">{phase.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{phase.tagline}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          {phase.estimatedHours}h catalog · skill floor {skillLevel}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1">
          {phase.modules.slice(0, 3).map((m) => (
            <li key={m.id} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {m.title}
            </li>
          ))}
        </ul>
      </Link>
    </li>
  );
}

function Status({ status }: { status: PhaseMeta["status"] }) {
  const label = status === "available" ? "Authored" : status === "preview" ? "Preview" : "Catalog";
  return (
    <Badge variant={status === "available" ? "default" : status === "preview" ? "secondary" : "outline"}>
      {label}
    </Badge>
  );
}
