"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress/store";
import type { QuizBlock } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

export function Quiz({ block }: { block: QuizBlock }) {
  const recordEvidence = useProgress((s) => s.recordEvidence);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const correct = block.questions.filter((q) => answers[q.id] === q.correctOptionId).length;
  const score = correct / block.questions.length;

  return (
    <div className="space-y-6">
      {block.questions.map((q, idx) => (
        <fieldset key={q.id} className="space-y-2">
          <legend className="text-sm font-medium">
            {idx + 1}. {q.prompt}
          </legend>
          <div className="space-y-1.5">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.id;
              const isCorrect = opt.id === q.correctOptionId;
              return (
                <label
                  key={opt.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-md border px-3 py-2 text-sm",
                    selected && !submitted && "border-primary/50 bg-accent",
                    submitted && isCorrect && "border-ok/40 bg-ok/10",
                    submitted && selected && !isCorrect && "border-sev/40 bg-sev/10",
                  )}
                >
                  <input
                    type="radio"
                    className="mt-1"
                    name={q.id}
                    value={opt.id}
                    disabled={submitted}
                    checked={selected}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                  />
                  <span>
                    <span className="block">{opt.text}</span>
                    {submitted ? (
                      <span className="mt-1 block text-xs text-muted-foreground">{opt.explanation}</span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      {!submitted ? (
        <Button
          disabled={Object.keys(answers).length < block.questions.length}
          onClick={() => {
            setSubmitted(true);
            for (const skillId of block.skillIds) {
              recordEvidence({
                skillId,
                source: "quiz",
                dimension: "conceptual",
                score,
                artifactId: block.id,
                note: `${correct}/${block.questions.length}`,
              });
            }
          }}
        >
          Submit knowledge check
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          {correct} of {block.questions.length} correct. Conceptual evidence recorded for{" "}
          {block.skillIds.join(", ")}.
        </p>
      )}
    </div>
  );
}
