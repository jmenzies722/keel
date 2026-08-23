import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhase, lessonsForPhase, PHASES } from "@content/curriculum/index";

export function generateStaticParams() {
  return PHASES.map((phase) => ({ phase: phase.slug }));
}

export default async function PhasePage({
  params,
}: {
  params: Promise<{ phase: string }>;
}) {
  const { phase } = await params;
  const meta = getPhase(phase);
  if (!meta) notFound();
  const lessons = lessonsForPhase(phase);

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Phase {meta.order} · {meta.track}
      </p>
      <h1 className="text-3xl font-medium tracking-tight">{meta.title}</h1>
      <p className="text-muted-foreground">{meta.description}</p>
      {lessons.length ? (
        <ul className="space-y-2">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link href={`/learn/${lesson.phaseSlug}/${lesson.slug}`} className="text-primary hover:underline">
                {lesson.title}
              </Link>
              <span className="ml-2 text-sm text-muted-foreground">{lesson.durationMin} min</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Catalog phase — modules are specified, lessons are not yet authored. The spine lives under Learn.
        </p>
      )}
    </div>
  );
}
