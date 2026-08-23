"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress/store";
import type { CodeExerciseBlock } from "@/lib/curriculum/types";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function CodeExercise({ block }: { block: CodeExerciseBlock }) {
  const recordEvidence = useProgress((s) => s.recordEvidence);
  const completeProject = useProgress((s) => s.completeProject);
  const [code, setCode] = useState(block.starterCode);
  const [results, setResults] = useState<{ name: string; ok: boolean; got: string }[] | null>(null);

  function run() {
    const rows = block.tests.map((test) => {
      try {
        const stripped = code.replace(/export\s+/g, "");
        const wrapped = `${stripped}\n; return (${test.call});`;
        const fn = new Function(wrapped);
        const got = fn();
        const ok = Object.is(got, test.expected) || JSON.stringify(got) === JSON.stringify(test.expected);
        return { name: test.name, ok, got: String(got) };
      } catch (error) {
        return { name: test.name, ok: false, got: error instanceof Error ? error.message : "error" };
      }
    });
    setResults(rows);
    const score = rows.filter((r) => r.ok).length / rows.length;
    if (score === 1) {
      completeProject(block.id);
      for (const skillId of block.skillIds) {
        recordEvidence({
          skillId,
          source: "project",
          dimension: "implementation",
          score: 1,
          artifactId: block.id,
        });
      }
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{block.title}</p>
        <p className="text-sm text-muted-foreground">{block.brief}</p>
      </div>
      <div className="overflow-hidden rounded-md ring-1 ring-foreground/10">
        <Editor
          height="260px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
        />
      </div>
      <Button size="sm" onClick={run}>
        Run tests
      </Button>
      {results ? (
        <ul className="space-y-1 text-sm">
          {results.map((row) => (
            <li key={row.name} className={row.ok ? "text-ok" : "text-sev"}>
              {row.ok ? "pass" : "fail"} · {row.name}
              {!row.ok ? <span className="ml-2 text-muted-foreground">got {row.got}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
