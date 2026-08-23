# Simulator architecture

Northstar Systems is a data-driven organization, not a hardcoded page. Additional companies can be added beside `content/company/northstar.ts`.

## Stages

| Stage | Role band | Infrastructure shape |
|---|---|---|
| 1 Startup | Junior Engineer | 1 API, 1 VM, PostgreSQL, DNS, basic CI |
| 2 Growing SaaS | DevOps Engineer | LB, multi-service, Redis, AWS, Terraform, Docker |
| 3 Cloud-native | Platform / SRE | EKS, GitOps, Prometheus, Grafana, OTel |
| 4 Internal platform | Platform Engineer | portal, catalog, platform API |
| 5 AI company | AI Platform Engineer | gateway, registry, GPU, vLLM, KServe |
| 6 AI at scale | Senior AI Platform | multi-region, multi-tenant GPU pools |
| 7 Agentic enterprise | Staff AI Platform | humans + agents as platform users |

MVP operates Stage 1 plus an advanced Stage 5 preview mission.

## Incident engine

Incidents are `IncidentScenario` records:

- symptoms and misleading signals
- simulated systems (terminal, logs, metrics, processes)
- root cause (hidden until debrief)
- valid investigation steps
- remediation that actually mutates scenario state
- consequence if the learner treats a symptom (restart-without-fix)

The engine scores:

- diagnosis quality
- command choice
- investigation order
- unnecessary actions
- hint use
- remediation
- verification

UI never contains the answer.

## Terminal

`SimulationTerminalRuntime` parses commands against a mission filesystem/process table. It does not execute a host shell.

The same `TerminalRuntime` interface can later wrap a sandbox.

## Debrief

Every resolved (or abandoned) mission produces:

- what happened
- root cause
- available signals
- recommended investigation path
- the learner's path
- strong decisions / missed signals
- production lesson
- skills demonstrated
- recommended next lesson
