"use client";

import { useState } from "react";
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

  return (
    <aside className="flex h-full min-h-[320px] flex-col rounded-lg ring-1 ring-foreground/10">
      <div className="border-b px-3 py-2">
        <p className="text-sm font-medium">Mentor</p>
        <p className="text-xs text-muted-foreground">Staff engineer. Will not dump answers.</p>
      </div>
      <div className="flex flex-wrap gap-1 px-3 py-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded px-2 py-1 text-[11px] ${mode === m.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-3 overflow-auto px-3 py-2 text-sm">
        {log.length === 0 ? (
          <p className="text-muted-foreground">
            Ask about the current process, unit, or metric. Default mode is Socratic.
          </p>
        ) : (
          log.map((turn, i) => (
            <div key={i} className="space-y-1">
              <p className="text-xs text-muted-foreground">You</p>
              <p>{turn.q}</p>
              <p className="text-xs text-muted-foreground">Mentor</p>
              <p>{turn.a}</p>
            </div>
          ))
        )}
      </div>
      <form
        className="border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!question.trim()) return;
          const a = mentorReply(question, {
            mode,
            hintLevel,
            lessonId,
            incidentId,
            discoveries,
            lastCommands,
          });
          setLog((l) => [...l, { q: question, a }]);
          setQuestion("");
          if (mode === "hint" || /hint|what's wrong|root cause/.test(question.toLowerCase())) {
            bumpHint(artifactId);
            setHintLevel(nextHintLevel(hintLevel));
          }
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
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Hint depth {hintLevel}/5</span>
          <Button size="sm" type="submit">
            Ask
          </Button>
        </div>
      </form>
    </aside>
  );
}
