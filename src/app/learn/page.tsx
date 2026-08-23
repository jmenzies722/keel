"use client";

import Link from "next/link";
import { AUTHORED_PATH } from "@content/path";
import { buttonVariants } from "@/components/ui/button";
import { useProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

export default function LearnHubPage() {
  const completedLessons = useProgress((s) => s.completedLessons);
  const resolvedIncidents = useProgress((s) => s.resolvedIncidents);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-medium tracking-tight">Learn</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Five authored lessons. After each one that has a company mission, operate the same skill at Northstar before moving on.
        </p>
      </header>
      <ol className="space-y-3">
        {AUTHORED_PATH.map((node, i) => {
          const done = completedLessons.includes(node.lesson);
          const missionDone = node.incident ? resolvedIncidents.includes(node.incident) : true;
          return (
            <li key={node.id} className="rounded-lg p-4 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="text-lg font-medium">{node.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {done ? "Lesson studied" : "Not studied"}
                    {node.incident ? ` · mission ${missionDone ? "resolved" : "open"}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/learn/${node.lesson}`} className={cn(buttonVariants({ size: "sm" }))}>
                    Open lesson
                  </Link>
                  {node.incident ? (
                    <Link
                      href={`/company/incidents/${node.incident}`}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    >
                      Mission
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
