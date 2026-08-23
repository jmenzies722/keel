"use client";

import Link from "next/link";
import { AUTHORED_PATH } from "@content/path";
import { INCIDENTS } from "@content/incidents";
import { INTERVIEWS } from "@content/interviews/catalog";
import { useProgress } from "@/lib/progress/store";

export default function PortfolioPage() {
  const completedLessons = useProgress((s) => s.completedLessons);
  const resolvedIncidents = useProgress((s) => s.resolvedIncidents);
  const projects = useProgress((s) => s.completedProjects ?? []);
  const interviews = useProgress((s) => s.completedInterviews ?? []);

  const lessons = AUTHORED_PATH.filter((n) => completedLessons.includes(n.lesson));
  const incidents = INCIDENTS.filter((i) => resolvedIncidents.includes(i.id));

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-3xl font-medium tracking-tight">Portfolio</h1>
        <p className="mt-2 text-muted-foreground">
          Only work you completed in this environment. Nothing is invented.
        </p>
      </header>
      <Block
        title="Lessons studied"
        empty="No lessons marked studied."
        items={lessons.map((n) => ({ href: `/learn/${n.lesson}`, label: n.title }))}
      />
      <Block
        title="Incidents resolved"
        empty="No Northstar incidents resolved."
        items={incidents.map((i) => ({ href: `/company/incidents/${i.id}`, label: `${i.severity} · ${i.title}` }))}
      />
      <Block
        title="Projects"
        empty="No project tests passed yet. The binary inspector lives in Data representation."
        items={projects.map((id) => ({ label: id }))}
      />
      <Block
        title="Interviews"
        empty="No interview passes recorded."
        items={interviews.map((id) => ({ label: INTERVIEWS.find((i) => i.id === id)?.title ?? id }))}
      />
    </div>
  );
}

function Block({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { href?: string; label: string }[];
}) {
  return (
    <section>
      <h2 className="font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {items.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              ) : (
                item.label
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
