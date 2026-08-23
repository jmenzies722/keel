"use client";

import { useMemo, useState } from "react";
import { INTERVIEWS } from "@content/interviews/catalog";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress/store";

export default function InterviewPage() {
  const completeInterview = useProgress((s) => s.completeInterview);
  const recordEvidence = useProgress((s) => s.recordEvidence);
  const done = useProgress((s) => s.completedInterviews ?? []);
  const [topic, setTopic] = useState(INTERVIEWS[0].id);
  const item = useMemo(() => INTERVIEWS.find((i) => i.id === topic) ?? INTERVIEWS[0], [topic]);
  const [answer, setAnswer] = useState("");
  const [round, setRound] = useState<1 | 2>(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  function score(text: string) {
    const lower = text.toLowerCase();
    const hits = item.keywords.filter((k) => lower.includes(k)).length;
    return hits / item.keywords.length;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-medium tracking-tight">Interview</h1>
        <p className="mt-2 text-muted-foreground">
          A staff interviewer. Shallow keyword dumps will get a follow-up. Evidence is recorded only after a complete pass.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {INTERVIEWS.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => {
              setTopic(i.id);
              setAnswer("");
              setRound(1);
              setFeedback(null);
            }}
            className={`rounded-md px-2.5 py-1 text-sm ${topic === i.id ? "bg-muted" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            {i.title}
            {done.includes(i.id) ? " · done" : ""}
          </button>
        ))}
      </div>
      <p className="text-sm font-medium">{round === 1 ? item.prompt : item.followUp}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={7}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        placeholder="Write as if you are on a whiteboard with a staff engineer."
      />
      <Button
        onClick={() => {
          const s = score(answer);
          if (round === 1) {
            setFeedback(
              s < 0.5
                ? "Too thin — you named almost none of the objects. Sit with the follow-up."
                : "You hit some of the structure. The follow-up is where shallow answers die.",
            );
            setAnswer("");
            setRound(2);
            return;
          }
          const combined = Math.min(1, s + 0.15);
          completeInterview(item.id);
          for (const skillId of item.skillIds) {
            recordEvidence({
              skillId,
              source: "interview",
              dimension: "conceptual",
              score: combined,
              artifactId: `interview-${item.id}`,
            });
          }
          setFeedback(`Recorded. A strong answer sounds like: ${item.strongAnswer}`);
        }}
      >
        {round === 1 ? "Submit" : "Submit follow-up"}
      </Button>
      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
    </div>
  );
}
