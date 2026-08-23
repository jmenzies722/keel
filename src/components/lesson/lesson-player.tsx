"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { getRuntime } from "@content/runtimes";
import { BinaryExplorer } from "@/components/visualizations/binary-explorer";
import { DnsResolution } from "@/components/visualizations/dns-resolution";
import { K8sControlLoop } from "@/components/visualizations/k8s-control-loop";
import { KvCache } from "@/components/visualizations/kv-cache";
import { ProcessLifecycle } from "@/components/visualizations/process-lifecycle";
import { CodeExercise } from "@/components/lesson/code-exercise";
import { MentorPanel } from "@/components/mentor/mentor-panel";
import { Quiz } from "@/components/lesson/quiz-block";
import { SimTerminal } from "@/components/terminal/sim-terminal";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Markdown } from "@/lib/md";
import { useProgress } from "@/lib/progress/store";
import type { Lesson, LessonBlock, LessonSection } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const [active, setActive] = useState(lesson.sections[0]?.id ?? "");
  const [discoveries, setDiscoveries] = useState<string[]>([]);
  const [commands, setCommands] = useState<string[]>([]);
  const recordSection = useProgress((s) => s.recordSection);
  const completeLesson = useProgress((s) => s.completeLesson);
  const recordEvidence = useProgress((s) => s.recordEvidence);
  const completedSections = useProgress((s) => s.completedSections);
  const completedLessons = useProgress((s) => s.completedLessons);
  const key = `${lesson.phaseSlug}/${lesson.slug}`;
  const section = lesson.sections.find((s) => s.id === active) ?? lesson.sections[0];

  const doneCount = lesson.sections.filter((s) => completedSections.includes(`${key}:${s.id}`)).length;
  const lessonComplete = completedLessons.includes(key);
  const progress = Math.round((doneCount / lesson.sections.length) * 100);

  function goToSection(id: string) {
    setActive(id);
    recordSection(key, id);
    window.requestAnimationFrame(() => {
      document.getElementById("lesson-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="grid min-w-0 max-w-full gap-6 xl:grid-cols-[230px_minmax(0,1fr)_310px]">
      <nav
        aria-label="Lesson sections"
        className="sticky top-16 z-30 -mx-4 min-w-0 max-w-[calc(100%+2rem)] border-y border-border/70 bg-background/95 px-4 py-3 backdrop-blur-xl md:-mx-6 md:max-w-[calc(100%+3rem)] md:px-6 xl:top-20 xl:mx-0 xl:max-w-full xl:self-start xl:rounded-xl xl:border xl:bg-card/80 xl:p-3"
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Lesson map</p>
          <span className="font-mono text-[11px] text-muted-foreground">{doneCount}/{lesson.sections.length}</span>
        </div>
        <Progress value={progress} aria-label="Sections opened" className="mb-3" />
        <ol className="flex gap-1.5 overflow-x-auto pb-1 xl:block xl:space-y-1 xl:overflow-visible xl:pb-0">
          {lesson.sections.map((s, i) => {
            const done = completedSections.includes(`${key}:${s.id}`);
            return (
              <li key={s.id} className="shrink-0 xl:shrink">
                <button
                  type="button"
                  onClick={() => goToSection(s.id)}
                  aria-current={active === s.id ? "step" : undefined}
                  className={cn(
                    "flex h-9 items-center rounded-lg border border-transparent px-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:h-auto xl:w-full xl:py-2 xl:text-sm",
                    active === s.id && "border-primary/20 bg-primary/10 text-foreground",
                  )}
                >
                  <span className="mr-2 grid size-5 shrink-0 place-items-center rounded-full bg-muted font-mono text-[9px]">
                    {done ? <Check className="size-3 text-ok" /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="max-w-36 truncate xl:max-w-none">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 hidden text-xs text-muted-foreground xl:block">
          {doneCount}/{lesson.sections.length} sections opened. Opening is not evidence.
        </p>
      </nav>

      <article id="lesson-content" className="min-w-0 scroll-mt-36 xl:scroll-mt-24">
        <header className="mb-6 border-b pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{lesson.phaseSlug}</Badge>
            <Badge variant="secondary">{lesson.durationMin} min</Badge>
            {lessonComplete ? <Badge><Check className="size-3" /> Studied</Badge> : null}
            <Button
              size="sm"
              variant={lessonComplete ? "secondary" : "outline"}
              className="ml-auto"
              onClick={() => completeLesson(key)}
              disabled={lessonComplete}
            >
              {lessonComplete ? <Check data-icon="inline-start" /> : null}
              {lessonComplete ? "Studied" : "Mark studied"}
            </Button>
          </div>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
            {lesson.phaseSlug} · {lesson.moduleSlug}
          </p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.025em]">{lesson.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{lesson.description}</p>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </header>
        <h2 className="mb-4 text-xl font-medium" aria-live="polite">{section.title}</h2>
        <div className="space-y-6">
          {section.blocks.map((block, i) => (
            <BlockView
              key={i}
              block={block}
              onDiscover={(ids, command) => {
                setDiscoveries((d) => [...new Set([...d, ...ids])]);
                if (command) setCommands((c) => [...c, command]);
                if (block.kind === "lab" && block.successDiscoveries.every((id) => [...discoveries, ...ids].includes(id))) {
                  for (const skillId of block.skillIds) {
                    recordEvidence({
                      skillId,
                      source: "lab",
                      dimension: skillId === "linux.cli" ? "implementation" : "debugging",
                      score: 0.85,
                      artifactId: block.id,
                    });
                  }
                }
                if (block.kind === "terminal" && block.successDiscoveries.every((id) => [...discoveries, ...ids].includes(id))) {
                  recordEvidence({
                    skillId: "linux.cli",
                    source: "exercise",
                    dimension: "implementation",
                    score: 0.8,
                    artifactId: block.runtimeId,
                  });
                }
              }}
            />
          ))}
        </div>
        <footer className="sticky bottom-3 z-20 mt-8 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/90 p-2 shadow-lg backdrop-blur-xl">
          <SectionNav
            sections={lesson.sections}
            active={active}
            onChange={goToSection}
          />
          <Button
            variant={lessonComplete ? "secondary" : "outline"}
            onClick={() => completeLesson(key)}
            disabled={lessonComplete}
          >
            {lessonComplete ? <Check data-icon="inline-start" /> : null}
            {lessonComplete ? "Lesson studied" : "Mark studied"}
          </Button>
        </footer>
      </article>

      <MentorPanel lessonId={key} discoveries={discoveries} lastCommands={commands} />
    </div>
  );
}

function SectionNav({
  sections,
  active,
  onChange,
}: {
  sections: LessonSection[];
  active: string;
  onChange: (id: string) => void;
}) {
  const idx = sections.findIndex((s) => s.id === active);
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" disabled={idx <= 0} onClick={() => onChange(sections[idx - 1].id)}>
        <ChevronLeft data-icon="inline-start" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={idx >= sections.length - 1}
        onClick={() => onChange(sections[idx + 1].id)}
      >
        <span className="hidden sm:inline">Next section</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight data-icon="inline-end" />
      </Button>
    </div>
  );
}

function BlockView({
  block,
  onDiscover,
}: {
  block: LessonBlock;
  onDiscover: (ids: string[], command?: string) => void;
}) {
  if (block.kind === "text") return <Markdown md={block.md} />;
  if (block.kind === "callout") {
    return (
      <aside className="rounded-md border-l-2 border-primary/50 bg-muted/40 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{block.variant}</p>
        <p className="mt-1 text-sm font-medium">{block.title}</p>
        <Markdown md={block.md} className="prose-lesson mt-2 text-sm" />
      </aside>
    );
  }
  if (block.kind === "visualization") {
    return (
      <figure>
        {block.visualization === "process-lifecycle" ? <ProcessLifecycle /> : null}
        {block.visualization === "binary-explorer" ? <BinaryExplorer /> : null}
        {block.visualization === "dns-resolution" ? <DnsResolution /> : null}
        {block.visualization === "k8s-control-loop" ? <K8sControlLoop /> : null}
        {block.visualization === "kv-cache" ? <KvCache /> : null}
        {block.caption ? <figcaption className="mt-2 text-xs text-muted-foreground">{block.caption}</figcaption> : null}
      </figure>
    );
  }
  if (block.kind === "example") {
    return (
      <div className="rounded-md ring-1 ring-foreground/10">
        <div className="border-b px-3 py-2 text-sm font-medium">{block.title}</div>
        {block.code ? (
          <pre className="overflow-auto bg-muted/50 p-3 font-mono text-xs">{block.code}</pre>
        ) : null}
        <div className="px-3 py-3">
          <Markdown md={block.md} className="prose-lesson text-sm" />
        </div>
      </div>
    );
  }
  if (block.kind === "quiz") return <Quiz block={block} />;
  if (block.kind === "code-exercise") return <CodeExercise block={block} />;
  if (block.kind === "terminal" || block.kind === "lab") {
    return <GuidedTerminal block={block} onDiscover={onDiscover} />;
  }
  if (block.kind === "related-mission") {
    return (
      <div className="rounded-md ring-1 ring-foreground/10 p-4">
        <p className="text-sm font-medium">{block.title}</p>
        <Markdown md={block.md} className="prose-lesson mt-2 text-sm" />
        <Link
          href={`/company/incidents/${block.incidentId}`}
          className={cn(buttonVariants(), "mt-3")}
        >
          Open company mission
        </Link>
      </div>
    );
  }
  if (block.kind === "references") {
    return (
      <ul className="space-y-2 text-sm">
        {block.items.map((item) => (
          <li key={item.title}>
            <span className="text-xs uppercase text-muted-foreground">{item.kind}</span>
            <span className="ml-2">{item.title}</span>
            {item.note ? <span className="ml-2 text-muted-foreground">— {item.note}</span> : null}
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

function GuidedTerminal({
  block,
  onDiscover,
}: {
  block: Extract<LessonBlock, { kind: "terminal" | "lab" }>;
  onDiscover: (ids: string[], command?: string) => void;
}) {
  const spec = useMemo(() => getRuntime(block.runtimeId), [block.runtimeId]);
  const [found, setFound] = useState<string[]>([]);
  const required = block.kind === "lab" || block.kind === "terminal" ? block.successDiscoveries : [];
  const complete = required.every((id) => found.includes(id));

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{block.title}</p>
        <p className="text-sm text-muted-foreground">{block.brief}</p>
      </div>
      <SimTerminal
        spec={spec}
        onEvent={(event) => {
          setFound((f) => [...new Set([...f, ...event.discoveries])]);
          onDiscover(event.discoveries, event.command);
        }}
      />
      <p className="text-xs text-muted-foreground">
        {complete
          ? "Required observations made. Evidence recorded."
          : `Still looking for: ${required.filter((id) => !found.includes(id)).join(", ") || "—"}`}
      </p>
    </div>
  );
}
