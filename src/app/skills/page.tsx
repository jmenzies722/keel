"use client";

import { SKILLS } from "@content/skills/catalog";
import { Bar } from "@/components/skills/meters";
import { useDerivedProgress } from "@/lib/progress/store";
import { SKILL_LEVEL_LABELS } from "@/lib/skills/types";

export default function SkillsPage() {
  const { progress } = useDerivedProgress();
  const categories = [...new Set(SKILLS.map((s) => s.category))];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-medium tracking-tight">Skill graph</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Levels move when you produce evidence — quizzes, labs, incidents — not when you open a page.
        </p>
      </header>
      {categories.map((category) => (
        <section key={category}>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">{category}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {SKILLS.filter((s) => s.category === category).map((skill) => {
              const row = progress[skill.id];
              return (
                <li key={skill.id} className="rounded-lg p-4 ring-1 ring-foreground/10">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium">{skill.title}</h3>
                    <span className="text-xs text-muted-foreground">{SKILL_LEVEL_LABELS[row?.level ?? 0]}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{skill.summary}</p>
                  <Bar className="mt-3" value={row?.overall ?? 0} label="Overall" />
                  {skill.prerequisites.length ? (
                    <p className="mt-2 text-xs text-muted-foreground">Requires {skill.prerequisites.join(", ")}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
