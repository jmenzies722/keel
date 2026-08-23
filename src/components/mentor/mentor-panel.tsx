"use client";

import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mentorReply, nextHintLevel, type HintLevel, type MentorMode } from "@/lib/mentor/policy";
import { useProgress } from "@/lib/progress/store";

const MODES: { id: MentorMode; label: string }[] = [
  { id: "socratic", label: "Socratic" },
  { id: "teach", label: "Teach me" },
  { id: "hint", label: "Hint" },
  { id: "debug", label: "Debug with me" },
  { id: "incident-coach", label: "Incident coach" },
  { id: "interview", label: "Interview me" },
];

export function MentorPanel({
  lessonId,
  incidentId,
  discoveries,
  lastCommands,
}: {
  lessonId?: string;
  incidentId?: string;
  discoveries: string[];
  lastCommands: string[];
}) {
  const bumpHint = useProgress((s) => s.bumpHint);
  const [mode, setMode] = useState<MentorMode>("socratic");
  const [hintLevel, setHintLevel] = useState<HintLevel>(1);
  const [question, setQuestion] = useState("");
  const [log, setLog] = useState<{ q: string; a: string }[]>([]);

  const artifactId = incidentId ?? lessonId ?? "mentor";

  function askMentor(rawQuestion: string) {
    const nextQuestion = rawQuestion.trim();
    if (!nextQuestion) return;
    const answer = mentorReply(nextQuestion, {
      mode,
      hintLevel,
      lessonId,
      incidentId,
      discoveries,
      lastCommands,
    });
    setLog((current) => [...current, { q: nextQuestion, a: answer }]);
    setQuestion("");
    if (mode === "hint" || /hint|what's wrong|root cause/.test(nextQuestion.toLowerCase())) {
      bumpHint(artifactId);
      setHintLevel(nextHintLevel(hintLevel));
    }
  }

  return (
    <aside className="flex min-h-[360px] flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)]">
      <div className="flex items-start gap-3 border-b px-3 py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium">Staff mentor</p>
          <p className="text-xs text-muted-foreground">Asks for evidence before giving answers.</p>
        </div>
        {log.length ? (
          <button
            type="button"
            className="ml-auto rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Clear mentor conversation"
            onClick={() => setLog([])}
          >
            <Trash2 className="size-3.5" />
          </button>
        ) : null}
      </div>
      <div className="flex gap-1 overflow-x-auto border-b px-3 py-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            aria-pressed={mode === m.id}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              mode === m.id
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-3 overflow-auto px-3 py-2 text-sm">
        {log.length === 0 ? (
          <div className="space-y-3 py-2">
            <p className="text-muted-foreground">
              Ask about the current process, unit, or metric. I will help you choose the next instrument.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["What evidence should I collect next?", "Challenge my current hypothesis."].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-lg border border-border px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/25 hover:text-foreground"
                  onClick={() => askMentor(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          log.map((turn, i) => (
            <div key={`${turn.q}-${i}`} className="space-y-2">
              <div className="ml-6 rounded-xl rounded-tr-sm bg-muted px-3 py-2">
                <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">You</p>
                <p>{turn.q}</p>
              </div>
              <div className="mr-4 rounded-xl rounded-tl-sm border border-primary/15 bg-primary/[0.04] px-3 py-2">
                <p className="mb-1 text-[10px] uppercase tracking-wide text-primary">Mentor</p>
                <p>{turn.a}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <form
        className="border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          askMentor(question);
        }}
      >
        <label className="sr-only" htmlFor="mentor-q">
          Question for mentor
        </label>
        <textarea
          id="mentor-q"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          placeholder="The unit is restarting. What should I look at first?"
          className="mb-2 w-full resize-none rounded-md border bg-background px-2 py-1.5 text-sm"
        />
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">Hint depth {hintLevel}/5</Badge>
          <Button size="sm" type="submit">
            Ask
          </Button>
        </div>
      </form>
    </aside>
  );
}
