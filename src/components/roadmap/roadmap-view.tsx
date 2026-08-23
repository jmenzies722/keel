"use client";

import Link from "next/link";
import { PHASES } from "@content/curriculum/phases";
import { AUTHORED_PATH } from "@content/path";
import { lessonsForPhase } from "@content/curriculum/index";
import { TRACKS, type PhaseMeta } from "@/lib/curriculum/types";
import { useDerivedProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

export function RoadmapView() {
  const { progress } = useDerivedProgress();

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-medium tracking-tight">Roadmap</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Forty-two phases from computing foundations to staff-level AI platform engineering. Catalog nodes describe the path. Authored nodes can be entered.
        </p>
      </header>
      {TRACKS.map((track) => {
        const phases = PHASES.filter((p) => p.track === track.id);
        return (
          <section key={track.id} id={track.id} className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">{track.title}</h2>
              <p className="text-sm text-muted-foreground">{track.blurb}</p>
            </div>
            <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {phases.map((phase) => (
                <PhaseCard key={phase.id} phase={phase} skillLevel={bestLevel(phase, progress)} />
              ))}
            </ol>
          </section>
        );
      })}
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
          "block h-full rounded-lg p-4 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40",
          phase.status === "available" && "ring-primary/30",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-xs text-muted-foreground">{String(phase.order).padStart(2, "0")}</span>
          <Status status={phase.status} />
        </div>
        <h3 className="mt-2 font-medium">{phase.title}</h3>
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
  return <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>;
}
