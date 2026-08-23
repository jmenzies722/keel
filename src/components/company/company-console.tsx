"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  LayoutDashboard,
  Radio,
  Server,
  Shield,
  Ticket,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { NORTHSTAR } from "@content/company/northstar";
import { INCIDENTS } from "@content/incidents";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { companyStageFromIncidents } from "@/lib/skills/graph";
import { useProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/company", label: "Overview", icon: LayoutDashboard },
  { href: "/company#tickets", label: "Tickets", icon: Ticket },
  { href: "/company#incidents", label: "Incidents", icon: Radio },
  { href: "/company#systems", label: "Systems", icon: Server },
  { href: "/company#runbooks", label: "Runbooks", icon: BookOpen },
];

export function CompanyFrame({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/company") return pathname === href;
    if (href.endsWith("#incidents")) return pathname.startsWith("/company/incidents/");
    return false;
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.15_0.012_250)] shadow-2xl shadow-black/20">
      <div className="flex min-h-16 items-center justify-between border-b border-white/10 px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 font-mono text-sm font-semibold text-white">
            N
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-[0.16em] text-white/45">{NORTHSTAR.name}</p>
            <p className="truncate text-sm text-white/80">{eyebrow ?? "Operations"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-sev/20 bg-sev/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-sev">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sev opacity-40" />
            <span className="relative inline-flex size-2 rounded-full bg-sev" />
          </span>
          Production
        </div>
      </div>
      <div className="grid min-w-0 flex-1 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-white/10 bg-black/10 md:border-b-0 md:border-r md:border-white/10">
          <div className="hidden px-4 pb-2 pt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/30 md:block">
            Staff console
          </div>
          <nav className="flex flex-row gap-1 overflow-x-auto p-2 md:flex-col md:px-3" aria-label="Company">
            {NAV.map((item) => (
              <CompanyNavLink key={item.label} {...item} active={isActive(item.href)} />
            ))}
          </nav>
          <div className="mx-3 mt-6 hidden rounded-lg border border-white/8 bg-white/[0.03] p-3 md:block">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Shield className="size-3.5" aria-hidden />
              Simulation boundary
            </div>
            <p className="mt-2 text-xs leading-5 text-white/35">Commands run against authored scenarios. No cloud credentials required.</p>
          </div>
        </aside>
        <div className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}

function CompanyNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white/90",
        active && "bg-white/8 text-white",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </Link>
  );
}

export function CompanyOverview() {
  const joinCompany = useProgress((s) => s.joinCompany);
  const joined = useProgress((s) => s.joinedCompany);
  const resolved = useProgress((s) => s.resolvedIncidents);
  const stageMeta = companyStageFromIncidents(resolved);
  const stage = NORTHSTAR.stages.find((s) => s.id === stageMeta.id) ?? NORTHSTAR.stages[0];
  const assignment = INCIDENTS.find((i) => !resolved.includes(i.id)) ?? INCIDENTS.at(-1)!;
  const openIncidents = INCIDENTS.length - resolved.length;

  return (
    <CompanyFrame eyebrow="Staff desk">
      <div className="space-y-8 text-white/85">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">Operations workspace</span>
              <span className="text-white/20">/</span>
              <span className="text-xs text-white/40">{stage.title}</span>
            </div>
            <h1 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight text-white sm:text-4xl">
              Welcome to {NORTHSTAR.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{NORTHSTAR.about}</p>
          </div>
          {!joined ? (
            <button type="button" className={cn(buttonVariants({ size: "lg" }), "shrink-0 rounded-full px-5")} onClick={joinCompany}>
              Join on-call roster
            </button>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ok/20 bg-ok/10 px-3 py-1.5 text-xs text-ok">
              <CheckCircle2 className="size-3.5" aria-hidden />
              Rostered as {stage.role}
            </span>
          )}
        </header>

        <section aria-label="Operations status" className="grid gap-3 sm:grid-cols-3">
          <CompanyStat label="Open incidents" value={`${openIncidents}`} detail={`${resolved.length} resolved`} />
          <CompanyStat label="Company stage" value={stage.title} detail={stage.role} />
          <CompanyStat label="Roster status" value={joined ? "Active" : "Not joined"} detail={joined ? "Evidence enabled" : "Join to start tracking"} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-xl border border-sev/20 bg-sev/[0.05] p-5 sm:p-6">
            <Radio className="pointer-events-none absolute -bottom-8 -right-8 size-40 text-sev/[0.05]" strokeWidth={0.8} aria-hidden />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-sev">Current assignment</p>
                <Badge variant="outline" className="border-sev/25 bg-sev/10 text-sev">
                  {resolved.includes(assignment.id) ? "Review" : assignment.severity}
                </Badge>
              </div>
              <h2 className="mt-4 text-2xl font-medium tracking-tight text-white">{assignment.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{assignment.summary}</p>
              <p className="mt-3 text-sm text-sev">{assignment.impact}</p>
              <Link href={`/company/incidents/${assignment.id}`} className={cn(buttonVariants(), "mt-6 rounded-full px-4")}>
                Open incident
                <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              <Activity className="size-3.5" aria-hidden />
              Current environment
            </div>
            <h2 className="mt-4 text-xl font-medium text-white">{stage.title}</h2>
            <p className="mt-1 text-sm text-primary">{stage.role}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {stage.infrastructure.map((item) => (
                <li key={item} className="rounded-md border border-white/8 bg-black/10 px-2.5 py-1.5 font-mono text-[11px] text-white/55">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="incidents" className="scroll-mt-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/35">Live queue</p>
              <h2 className="mt-2 text-xl font-medium text-white">Incidents</h2>
            </div>
            <span className="font-mono text-xs text-white/40">{openIncidents} open</span>
          </div>
          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            {INCIDENTS.map((inc) => {
              const isResolved = resolved.includes(inc.id);
              return (
                <li key={inc.id}>
                  <Link
                    href={`/company/incidents/${inc.id}`}
                    className="group flex h-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    {isResolved ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />
                    ) : (
                      <Circle className="mt-0.5 size-4 shrink-0 text-sev/80" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/35">
                        {inc.severity}
                        {inc.preview ? <span>· advanced preview</span> : null}
                      </span>
                      <span className="mt-1 block font-medium text-white transition-colors group-hover:text-primary">{inc.title}</span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-white/45">{inc.summary}</span>
                    </span>
                    <span className="text-[11px] text-white/35">{isResolved ? "Resolved" : "Open"}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <InfoPanel id="tickets" icon={Ticket} eyebrow="Backlog" title="Platform tickets">
            <ul className="space-y-3 text-sm">
              <TicketLink href="/company/incidents/checkout-api-crash" code="PLAT-12">checkout-api restart loop</TicketLink>
              <TicketLink href="/company/incidents/broken-dns" code="PLAT-40">DNS cutover leftovers</TicketLink>
              <TicketLink href="/company/incidents/crashloop-backoff" code="PLAT-88">secret hygiene regression</TicketLink>
              <TicketLink href="/company/incidents/inference-kv-cache" code="PLAT-201">inference SLO</TicketLink>
            </ul>
          </InfoPanel>

          <InfoPanel id="systems" icon={Server} eyebrow="Tooling" title="Systems">
            <p className="text-sm leading-6 text-white/50">
              Terminal, journal, and host metrics are attached to each incident. AWS and Kubernetes surface as the company evolves.
            </p>
          </InfoPanel>

          <InfoPanel id="runbooks" icon={Wrench} eyebrow="Operating model" title="Runbooks">
            <p className="text-sm leading-6 text-white/50">
              Prefer method over runbook bingo: state → logs → process table → remediate → verify.
            </p>
            <Link href="/learn/linux-os/processes" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Read Linux Processes
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </InfoPanel>
        </section>
      </div>
    </CompanyFrame>
  );
}

function CompanyStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-2 truncate text-lg font-medium text-white">{value}</p>
      <p className="mt-1 truncate text-xs text-white/40">{detail}</p>
    </div>
  );
}

function InfoPanel({
  id,
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
        <Icon className="size-3.5" aria-hidden />
        {eyebrow}
      </div>
      <h2 className="mt-3 text-lg font-medium text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TicketLink({ href, code, children }: { href: string; code: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="group flex items-start gap-2 text-white/60 hover:text-white">
        <FileText className="mt-0.5 size-3.5 shrink-0 text-white/30 group-hover:text-primary" aria-hidden />
        <span>
          <span className="font-mono text-[11px] text-primary">{code}</span>
          <span className="ml-2">{children}</span>
        </span>
      </Link>
    </li>
  );
}
