"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { Button, buttonVariants } from "@/components/ui/button";
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
  const key = `${lesson.phaseSlug}/${lesson.slug}`;
  const section = lesson.sections.find((s) => s.id === active) ?? lesson.sections[0];

  const doneCount = lesson.sections.filter((s) => completedSections.includes(`${key}:${s.id}`)).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
      <nav aria-label="Lesson sections" className="xl:sticky xl:top-20 xl:self-start">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Lesson</p>
        <ol className="space-y-1">
          {lesson.sections.map((s, i) => {
            const done = completedSections.includes(`${key}:${s.id}`);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(s.id);
                    recordSection(key, s.id);
                  }}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                    active === s.id && "bg-muted text-foreground",
                  )}
                >
                  <span className="mr-2 font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                  {done ? <span className="sr-only"> (visited)</span> : null}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-xs text-muted-foreground">
          {doneCount}/{lesson.sections.length} sections opened. Opening is not evidence.
        </p>
      </nav>

      <article>
        <header className="mb-6 border-b pb-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {lesson.phaseSlug} · {lesson.moduleSlug}
          </p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight">{lesson.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{lesson.description}</p>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </header>
        <h2 className="mb-4 text-lg font-medium">{section.title}</h2>
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
        <footer className="mt-8 flex items-center justify-between border-t pt-4">
          <SectionNav
            sections={lesson.sections}
            active={active}
            onChange={(id) => {
              setActive(id);
              recordSection(key, id);
            }}
          />
          <Button
            variant="outline"
            onClick={() => completeLesson(key)}
          >
            Mark lesson studied
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
        Previous
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={idx >= sections.length - 1}
        onClick={() => onChange(sections[idx + 1].id)}
      >
        Next section
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
