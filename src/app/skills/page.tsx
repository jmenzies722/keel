"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { SKILLS } from "@content/skills/catalog";
import { DimensionStack } from "@/components/skills/meters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDerivedProgress } from "@/lib/progress/store";
import { SKILL_LEVEL_LABELS } from "@/lib/skills/types";

export default function SkillsPage() {
  const { progress } = useDerivedProgress();
  const categories = [...new Set(SKILLS.map((s) => s.category))];
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSkills = SKILLS.filter(
    (skill) =>
      (category === "All" || skill.category === category) &&
      (!normalizedQuery ||
        skill.title.toLowerCase().includes(normalizedQuery) ||
        skill.summary.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <div className="space-y-8">
      <header className="border-b border-border/70 pb-7">
        <Badge variant="outline" className="mb-3">Evidence model</Badge>
        <h1 className="text-4xl font-medium tracking-[-0.03em]">Skill graph</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Levels move when you produce evidence — quizzes, labs, incidents — not when you open a page.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <label className="relative max-w-xl">
            <span className="sr-only">Search skills</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the graph…"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Skill categories">
            {["All", ...categories].map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={category === item ? "default" : "outline"}
                className="shrink-0"
                onClick={() => setCategory(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </header>
      {categories.map((categoryName) => {
        const categorySkills = visibleSkills.filter((skill) => skill.category === categoryName);
        if (categorySkills.length === 0) return null;
        return (
        <section key={categoryName}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{categoryName}</h2>
            <span className="font-mono text-xs text-muted-foreground">{categorySkills.length} skills</span>
          </div>
          <ul className="grid gap-3 lg:grid-cols-2">
            {categorySkills.map((skill) => {
              const row = progress[skill.id];
              return (
                <li key={skill.id}>
                  <Card className="h-full transition-colors hover:bg-muted/20">
                    <CardHeader>
                      <CardTitle>{skill.title}</CardTitle>
                      <CardAction>
                        <Badge variant={row?.level ? "secondary" : "outline"}>
                          {SKILL_LEVEL_LABELS[row?.level ?? 0]}
                        </Badge>
                      </CardAction>
                      <CardDescription>{skill.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DimensionStack dimensions={row?.dimensions ?? []} />
                      {skill.prerequisites.length ? (
                        <p className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                          Requires {skill.prerequisites.join(", ")}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
        );
      })}
      {visibleSkills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No skills match that search.</p>
          <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => { setQuery(""); setCategory("All"); }}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
