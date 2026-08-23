import { notFound } from "next/navigation";
import { getLesson, PHASES, LESSONS } from "@content/curriculum/index";
import { LessonPlayer } from "@/components/lesson/lesson-player";

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({
    phase: lesson.phaseSlug,
    lesson: lesson.slug,
  }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ phase: string; lesson: string }>;
}) {
  const { phase, lesson } = await params;
  const data = getLesson(phase, lesson);
  if (!data) {
    const known = PHASES.some((p) => p.slug === phase);
    if (known) {
      return (
        <div className="max-w-xl space-y-3">
          <h1 className="text-2xl font-medium">Catalog node</h1>
          <p className="text-muted-foreground">
            This phase is on the roadmap. The authored vertical slice is Linux Processes.
          </p>
        </div>
      );
    }
    notFound();
  }
  return <LessonPlayer lesson={data} />;
}
