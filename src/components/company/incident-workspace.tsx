"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getRuntime } from "@content/runtimes";
import { MentorPanel } from "@/components/mentor/mentor-panel";
import { SimTerminal } from "@/components/terminal/sim-terminal";
import { Button, buttonVariants } from "@/components/ui/button";
import { evaluateIncident } from "@/lib/simulator/evaluate";
import { applyEffects, isResolved } from "@/lib/simulator/resolution";
import type { IncidentScenario } from "@/lib/simulator/types";
import { useProgress } from "@/lib/progress/store";
import { CompanyFrame } from "./company-console";
import { cn } from "@/lib/utils";

export function IncidentWorkspace({ scenario }: { scenario: IncidentScenario }) {
  const startIncident = useProgress((s) => s.startIncident);
  const appendCommand = useProgress((s) => s.appendCommand);
  const addDiscoveries = useProgress((s) => s.addDiscoveries);
  const markSymptomRestart = useProgress((s) => s.markSymptomRestart);
  const resolveIncident = useProgress((s) => s.resolveIncident);
  const attempt = useProgress((s) => s.attempts.find((a) => a.incidentId === scenario.id));
  const alreadyResolved = useProgress((s) => s.resolvedIncidents.includes(scenario.id));

  const spec = useMemo(() => getRuntime(scenario.runtimeId), [scenario.runtimeId]);
  const [state, setState] = useState<Record<string, boolean | string | number>>(
    () => scenario.initialState ?? {},
  );
  const [localDiscoveries, setLocalDiscoveries] = useState<string[]>([]);
  const [commands, setCommands] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<string>();
  const [showDebrief, setShowDebrief] = useState(alreadyResolved);
  const [consequence, setConsequence] = useState<string | null>(null);

  useEffect(() => {
    startIncident(scenario.id);
  }, [scenario.id, startIncident]);

  const discoveries = [...new Set([...(attempt?.discoveries ?? []), ...localDiscoveries])];
  const resolvedNow = alreadyResolved || isResolved(scenario, state, discoveries);

  return (
    <CompanyFrame eyebrow={`${scenario.severity} · ${scenario.title}`}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5 text-white/85">
          <header>
            <p className="text-xs uppercase tracking-wide text-white/40">
              {scenario.preview ? "Advanced preview · not beginner content" : "Production incident"}
            </p>
            <h1 className="mt-1 text-2xl font-medium text-white">{scenario.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/55">{scenario.summary}</p>
            <p className="mt-1 text-sm text-sev">{scenario.impact}</p>
          </header>

          <section className="grid gap-3 md:grid-cols-2">
            {scenario.symptoms.map((s) => (
              <article key={s.id} className="rounded-md bg-white/4 p-3 ring-1 ring-white/10">
                <p className="text-[11px] uppercase tracking-wide text-white/40">
                  {s.system}
                  {s.misleading ? " · easy to over-weight" : ""}
                </p>
                <h2 className="mt-1 text-sm font-medium text-white">{s.title}</h2>
                <p className="mt-1 text-sm text-white/55">{s.body}</p>
              </article>
            ))}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium text-white">Investigation terminal</h2>
            <SimTerminal
              spec={spec}
              initialState={state}
              onEvent={(event) => {
                const next = applyEffects(state, event.effects);
                setState(next);
                setLocalDiscoveries((d) => [...new Set([...d, ...event.discoveries])]);
                setCommands((c) => [...c, event.command]);
                appendCommand(scenario.id, event.command);
                addDiscoveries(scenario.id, event.discoveries);
                if (event.discoveries.includes("symptom-restart")) {
                  markSymptomRestart(scenario.id);
                  setConsequence(
                    scenario.id === "crashloop-backoff"
                      ? "The new pod is crashing too. Deleting a pod does not create a missing Secret."
                      : "The unit failed again immediately. A restart did not remove the condition that made ExecStart exit.",
                  );
                }
              }}
            />
            {consequence ? <p className="mt-2 text-sm text-warn">{consequence}</p> : null}
            {discoveries.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wide text-white/40">Your observations</p>
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {scenario.discoveries
                    .filter((d) => discoveries.includes(d.id))
                    .map((d) => (
                      <li key={d.id} className="rounded bg-white/8 px-2 py-0.5 text-[11px] text-white/70">
                        {d.label}
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </section>

          {scenario.diagnosisOptions ? (
            <section className="rounded-md bg-white/4 p-4 ring-1 ring-white/10">
              <h2 className="text-sm font-medium text-white">Diagnosis</h2>
              <p className="mt-1 text-sm text-white/50">
                Name the constraint. Do not pick the first metric that is red.
              </p>
              <div className="mt-3 space-y-2">
                {scenario.diagnosisOptions.map((opt) => (
                  <label key={opt.id} className="flex gap-2 text-sm">
                    <input
                      type="radio"
                      name="diagnosis"
                      disabled={alreadyResolved}
                      checked={diagnosis === opt.id}
                      onChange={() => setDiagnosis(opt.id)}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={alreadyResolved || (!resolvedNow && !diagnosis)}
              onClick={() => {
                if (scenario.diagnosisOptions) {
                  const correct = scenario.diagnosisOptions.find((o) => o.correct)?.id;
                  if (diagnosis !== correct) {
                    setConsequence("That diagnosis does not explain the queue, the cache, and the idle SM% together. Keep investigating.");
                    return;
                  }
                  addDiscoveries(scenario.id, ["diagnosis-correct"]);
                  setLocalDiscoveries((d) => [...new Set([...d, "diagnosis-correct"])]);
                }
                if (!scenario.diagnosisOptions && !isResolved(scenario, state, discoveries)) {
                  setConsequence("The service is not healthy yet. Verify after remediating.");
                  return;
                }
                resolveIncident(scenario, diagnosis ?? scenario.rootCause.id);
                setShowDebrief(true);
              }}
            >
              {scenario.diagnosisOptions ? "Submit diagnosis" : "Confirm resolution"}
            </Button>
            <Link href="/company" className={cn(buttonVariants({ variant: "outline" }), "border-white/15 text-white")}>
              Back to desk
            </Link>
            {!scenario.diagnosisOptions && !resolvedNow ? (
              <p className="basis-full text-xs text-white/40">
                Confirm enables after the unit is healthy and you have verified it — not after a restart attempt.
              </p>
            ) : null}
          </div>

          {showDebrief && attempt ? (
            <Debrief scenario={scenario} />
          ) : (
            <p className="text-xs text-white/40">
              Root cause is withheld until you resolve the incident. Mentor will not skip the investigation.
            </p>
          )}
        </div>
        <MentorPanel
          incidentId={scenario.id}
          lessonId={scenario.debrief.relatedLessonHref.includes("linux") ? "linux-os/processes" : undefined}
          discoveries={discoveries}
          lastCommands={commands}
        />
      </div>
    </CompanyFrame>
  );
}

function Debrief({ scenario }: { scenario: IncidentScenario }) {
  const attempt = useProgress((s) => s.attempts.find((a) => a.incidentId === scenario.id && a.resolved));
  if (!attempt) return null;
  const evaluation = evaluateIncident(scenario, attempt);

  return (
    <section className="space-y-3 rounded-md bg-white/4 p-4 ring-1 ring-white/10">
      <h2 className="text-lg font-medium text-white">Debrief</h2>
      <Block title="What happened" body={scenario.debrief.whatHappened} />
      <Block title="Root cause" body={`${scenario.rootCause.summary} ${scenario.rootCause.detail}`} />
      <div>
        <p className="text-xs uppercase tracking-wide text-white/40">Recommended path</p>
        <ol className="mt-1 list-decimal pl-5 text-sm text-white/70">
          {scenario.debrief.recommendedPath.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-white/40">Your path</p>
        <ol className="mt-1 list-decimal pl-5 font-mono text-xs text-white/60">
          {evaluation.yourPath.map((step, i) => (
            <li key={`${step}-${i}`}>{step}</li>
          ))}
        </ol>
      </div>
      {evaluation.strongDecisions.length ? (
        <Block title="Strong decisions" body={evaluation.strongDecisions.join(" ")} />
      ) : null}
      {evaluation.missedSignals.length ? (
        <Block title="Missed signals" body={evaluation.missedSignals.join(" · ")} />
      ) : null}
      <Block title="Production lesson" body={scenario.debrief.productionLesson} />
      <p className="text-sm">
        Related:{" "}
        <Link href={scenario.debrief.relatedLessonHref} className="text-primary hover:underline">
          {scenario.debrief.relatedLessonTitle}
        </Link>
      </p>
      <p className="text-xs text-white/40">
        Overall investigation score {Math.round(evaluation.overall * 100)}%. This writes skill evidence — it does not invent a certificate.
      </p>
    </section>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/40">{title}</p>
      <p className="mt-1 text-sm text-white/70">{body}</p>
    </div>
  );
}
