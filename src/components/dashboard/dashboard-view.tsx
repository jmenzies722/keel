"use client";

import Link from "next/link";
import { Activity, ArrowRight, Building2, Flame, Target } from "lucide-react";
import { INCIDENTS } from "@content/incidents";
import { AUTHORED_PATH } from "@content/path";
import { SKILLS } from "@content/skills/catalog";
import { DimensionStack } from "@/components/skills/meters";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  const spinePercent = Math.round((spineDone / AUTHORED_PATH.length) * 100);

  return (
    <div className="space-y-6">
      {!onboarded ? (
        <Card className="border border-primary/20 bg-primary/[0.04] ring-primary/20">
          <CardHeader>
            <CardTitle>Choose your operating mode</CardTitle>
            <CardDescription className="max-w-2xl">
              Learn builds the model. Company tests it under pressure. Both modes write to the same evidence graph.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/learn" className={cn(buttonVariants())} onClick={() => markOnboarded()}>
              Start with Learn
            </Link>
            <Link
              href="/company"
              className={cn(buttonVariants({ variant: "outline" }))}
              onClick={() => markOnboarded()}
            >
              Start on-call
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Stat icon={Target} label="Competency band" value={band.title} hint={band.blurb} />
        <Stat icon={Flame} label="Current streak" value={streak ? `${streak} days` : "Start today"} hint="Activity is stored on this device." />
        <Stat icon={Activity} label="Evidence" value={`${evidence.length} records`} hint={`${resolvedIncidents.length} missions resolved`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative min-h-52 border border-primary/20 bg-card ring-primary/20">
          <CardHeader>
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary">Recommended next</Badge>
            <CardTitle className="text-xl">{recommendation.title}</CardTitle>
            <CardDescription className="max-w-lg">{recommendation.reason}</CardDescription>
            <CardAction>
              <span className="font-mono text-xs text-muted-foreground">{spinePercent}% spine</span>
            </CardAction>
          </CardHeader>
          <CardContent className="mt-auto">
            <Progress value={spinePercent} aria-label="Authored spine progress" className="mb-5" />
            <Link href={recommendation.href} className={cn(buttonVariants(), "gap-2 rounded-full px-4")}>
              Continue path <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="min-h-52 border border-border/70">
          <CardHeader>
            <Badge variant="secondary" className="mb-2">Company simulator</Badge>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building2 className="size-5 text-primary" />
              Northstar Systems
            </CardTitle>
            <CardDescription>
              Four production missions turn lesson knowledge into incident evidence.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link href="/company" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-4")}>
              Open staff desk
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              {SKILLS.find((s) => s.id === featured?.skillId)?.title ?? "Skill"}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
              {SKILL_LEVEL_LABELS[featured?.level ?? 0]}
              </Badge>
            </CardAction>
            <CardDescription>Your next skill edge, broken down by evidence type.</CardDescription>
          </CardHeader>
          <CardContent>
            <DimensionStack dimensions={featured?.dimensions ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mission queue</CardTitle>
            <CardDescription>Open incidents remain available in any order.</CardDescription>
          </CardHeader>
          <CardContent>
          <ul className="divide-y divide-border/70 text-sm">
            {INCIDENTS.map((inc) => (
              <li key={inc.id}>
                <Link
                  href={`/company/incidents/${inc.id}`}
                  className="group flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span>
                    <span className="block text-foreground transition-colors group-hover:text-primary">{inc.title}</span>
                    <span className="text-xs text-muted-foreground">{inc.severity}{inc.preview ? " · advanced" : ""}</span>
                  </span>
                  <Badge variant={resolvedIncidents.includes(inc.id) ? "secondary" : "outline"}>
                    {resolvedIncidents.includes(inc.id) ? "Resolved" : "Open"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent evidence</CardTitle>
          <CardDescription>Competence changes when you produce an artifact—not when you open a page.</CardDescription>
        </CardHeader>
        <CardContent>
        {recent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <p className="text-sm font-medium">No evidence yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Complete a quiz, lab, incident, or interview to start the graph.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70 text-sm">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span>
                  {SKILLS.find((s) => s.id === e.skillId)?.title ?? e.skillId}
                  <span className="ml-2 text-xs text-muted-foreground">{e.source} · {e.dimension}</span>
                </span>
                <Badge variant="secondary" className="font-mono">{Math.round(e.score * 100)}%</Badge>
              </li>
            ))}
          </ul>
        )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-lg font-medium">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
