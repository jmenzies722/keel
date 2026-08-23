"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Check, RadioTower } from "lucide-react";
import { AUTHORED_PATH } from "@content/path";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDerivedProgress, useProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

export default function LearnHubPage() {
  const completedLessons = useProgress((s) => s.completedLessons);
  const resolvedIncidents = useProgress((s) => s.resolvedIncidents);
  const { recommendation } = useDerivedProgress();
  const totalUnits = AUTHORED_PATH.reduce((sum, node) => sum + 1 + (node.incident ? 1 : 0), 0);
  const completedUnits = AUTHORED_PATH.reduce(
    (sum, node) =>
      sum +
      (completedLessons.includes(node.lesson) ? 1 : 0) +
      (node.incident && resolvedIncidents.includes(node.incident) ? 1 : 0),
    0,
  );
  const pathPercent = Math.round((completedUnits / totalUnits) * 100);

  return (
    <div className="space-y-8">
      <header className="grid gap-6 border-b border-border/70 pb-7 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <Badge variant="outline" className="mb-3">Authored path</Badge>
          <h1 className="text-4xl font-medium tracking-[-0.03em]">Learn, then operate.</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
          Five authored lessons. After each one that has a company mission, operate the same skill at Northstar before moving on.
          </p>
        </div>
        <Card size="sm" className="bg-card/70">
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Path progress</span>
              <span className="font-mono">{completedUnits}/{totalUnits} units</span>
            </div>
            <Progress value={pathPercent} aria-label="Learning path progress" />
            <Link
              href={recommendation.href}
              className={cn(buttonVariants({ size: "sm" }), "mt-4 w-full justify-between")}
            >
              {recommendation.title}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>
      </header>
      <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[1.45rem] before:top-6 before:w-px before:bg-border md:before:left-[1.7rem]">
        {AUTHORED_PATH.map((node, i) => {
          const done = completedLessons.includes(node.lesson);
          const missionDone = node.incident ? resolvedIncidents.includes(node.incident) : true;
          const lessonHref = `/learn/${node.lesson}`;
          const current =
            (!done && recommendation.href === lessonHref) ||
            Boolean(node.incident && !missionDone && recommendation.href.includes(node.incident));
          return (
            <li key={node.id} className="relative grid grid-cols-[2.9rem_minmax(0,1fr)] gap-3 md:grid-cols-[3.4rem_minmax(0,1fr)]">
              <div
                className={cn(
                  "relative z-10 grid size-12 place-items-center rounded-full border bg-background font-mono text-xs text-muted-foreground md:size-14",
                  done && "border-ok/40 bg-ok/10 text-ok",
                  current && !done && "border-primary/40 bg-primary/10 text-primary ring-4 ring-primary/5",
                )}
              >
                {done ? <Check className="size-4" /> : String(i + 1).padStart(2, "0")}
              </div>
              <Card className={cn("transition-colors", current && "border border-primary/25 bg-primary/[0.035] ring-primary/20")}>
                <CardContent className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={done ? "secondary" : "outline"}>
                        <BookOpen className="size-3" />
                        {done ? "Studied" : "Lesson"}
                      </Badge>
                      {node.incident ? (
                        <Badge variant={missionDone ? "secondary" : "outline"}>
                          <RadioTower className="size-3" />
                          {missionDone ? "Mission resolved" : "Mission open"}
                        </Badge>
                      ) : null}
                      {current ? <Badge>Up next</Badge> : null}
                    </div>
                    <h2 className="text-lg font-medium">{node.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {node.incidentTitle ?? "Build the foundation before entering production."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Link href={lessonHref} className={cn(buttonVariants({ size: "sm" }))}>
                      {done ? "Review lesson" : "Open lesson"}
                    </Link>
                    {node.incident ? (
                      <Link
                        href={`/company/incidents/${node.incident}`}
                        className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                      >
                        Open mission
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
