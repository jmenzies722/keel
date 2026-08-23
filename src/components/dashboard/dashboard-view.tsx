"use client";

import Link from "next/link";
import { INCIDENTS } from "@content/incidents";
import { AUTHORED_PATH } from "@content/path";
import { SKILLS } from "@content/skills/catalog";
import { DimensionStack } from "@/components/skills/meters";
import { brand } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/button";
import { useDerivedProgress, useProgress } from "@/lib/progress/store";
import { SKILL_LEVEL_LABELS } from "@/lib/skills/types";
import { cn } from "@/lib/utils";

const FEATURED = ["cs.representation", "linux.processes", "net.dns", "k8s.workloads", "serve.vllm"] as const;

export function DashboardView() {
  const { progress, band, recommendation, streak } = useDerivedProgress();
  const completedLessons = useProgress((s) => s.completedLessons);
  const resolvedIncidents = useProgress((s) => s.resolvedIncidents);
  const evidence = useProgress((s) => s.evidence);
  const onboarded = useProgress((s) => s.onboarded);
  const markOnboarded = useProgress((s) => s.markOnboarded);
  const featured = progress[FEATURED.find((id) => (progress[id]?.overall ?? 0) < 0.6) ?? "linux.processes"];
  const recent = [...evidence].slice(-6).reverse();
  const spineDone = AUTHORED_PATH.filter((n) => completedLessons.includes(n.lesson)).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {brand.productName} · {brand.descriptor}
          </p>
          <h1 className="mt-1 text-3xl font-medium tracking-tight">Engineering desk</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{brand.tagline}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-muted-foreground">Competency band</p>
          <p className="font-medium">{band.title}</p>
          <p className="text-xs text-muted-foreground">{band.blurb}</p>
        </div>
      </header>

      {!onboarded ? (
        <section className="rounded-lg p-5 ring-1 ring-primary/30">
          <h2 className="text-lg font-medium">Two ways through Keel</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Learn is the curriculum. Company is Northstar Systems. They share one skill graph. Start with representation, or walk into the first incident if you already know processes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/learn" className={cn(buttonVariants())} onClick={() => markOnboarded()}>
              Start learning
            </Link>
            <Link href="/company" className={cn(buttonVariants({ variant: "outline" }))} onClick={() => markOnboarded()}>
              Enter Northstar
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Target role" value="AI Platform Engineer" hint="A competency band, not an offer letter." />
        <Stat label="Days active" value={streak ? `${streak}` : "—"} hint="This device only." />
        <Stat
          label="Spine"
          value={`${spineDone}/${AUTHORED_PATH.length}`}
          hint={`${evidence.length} evidence records · ${resolvedIncidents.length} missions`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg p-5 ring-1 ring-foreground/10">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Continue learning</p>
          <h2 className="mt-1 text-lg font-medium">{recommendation.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{recommendation.reason}</p>
          <Link href={recommendation.href} className={cn(buttonVariants(), "mt-4")}>
            Continue
          </Link>
        </div>
        <div className="rounded-lg p-5 ring-1 ring-foreground/10">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Continue working</p>
          <h2 className="mt-1 text-lg font-medium">Northstar Systems</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Four production missions on the spine: Linux, DNS, CrashLoopBackOff, inference.
          </p>
          <Link href="/company" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
            Enter company
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg p-5 ring-1 ring-foreground/10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-medium">
              {SKILLS.find((s) => s.id === featured?.skillId)?.title ?? "Skill"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {SKILL_LEVEL_LABELS[featured?.level ?? 0]}
            </span>
          </div>
          <DimensionStack dimensions={featured?.dimensions ?? []} />
        </div>
        <div className="rounded-lg p-5 ring-1 ring-foreground/10">
          <h2 className="font-medium">Missions</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {INCIDENTS.map((inc) => (
              <li key={inc.id} className="flex items-center justify-between gap-3">
                <Link href={`/company/incidents/${inc.id}`} className="hover:underline">
                  {inc.preview ? "Preview · " : ""}
                  {inc.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {resolvedIncidents.includes(inc.id) ? "Resolved" : "Open"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg p-5 ring-1 ring-foreground/10">
        <h2 className="font-medium">Recent evidence</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">None yet. Quizzes, labs, incidents, and interviews write here.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {recent.map((e) => (
              <li key={e.id} className="flex justify-between gap-3">
                <span>
                  {SKILLS.find((s) => s.id === e.skillId)?.title ?? e.skillId}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {e.source} · {e.dimension}
                  </span>
                </span>
                <span className="tabular-nums text-muted-foreground">{Math.round(e.score * 100)}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg p-4 ring-1 ring-foreground/10">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
