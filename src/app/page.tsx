import Link from "next/link";
import { ArrowRight, BookOpen, Building2, Network } from "lucide-react";
import { brand } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/button";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-2xl border border-border/70 bg-card px-6 py-9 shadow-sm md:px-10 md:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 85% 15%, color-mix(in oklch, var(--primary) 20%, transparent), transparent 32%), radial-gradient(circle at 15% 90%, color-mix(in oklch, var(--ok) 10%, transparent), transparent 30%)",
          }}
          aria-hidden
        />
        <div className="relative max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
              {brand.descriptor}
            </span>
            <span className="text-xs text-muted-foreground">One skill graph · two operating modes</span>
          </div>
          <h1 className="max-w-2xl text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-balance md:text-6xl">
            Learn the systems.
            <span className="block text-muted-foreground">Operate the company.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Build AI platform engineering judgment through authored lessons, simulated terminals, and production incidents at Northstar Systems.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/learn" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5")}>
              <BookOpen data-icon="inline-start" />
              Start the path
              <ArrowRight data-icon="inline-end" />
          </Link>
            <Link
              href="/company"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full px-5")}
            >
              <Building2 data-icon="inline-start" />
              Enter Northstar
            </Link>
          </div>
          <dl className="mt-9 grid max-w-2xl grid-cols-3 gap-3 border-t border-border/70 pt-5 text-sm">
            <Metric value="42" label="phase roadmap" />
            <Metric value="5" label="authored lessons" />
            <Metric value="4" label="production missions" />
          </dl>
        </div>
        <Network className="pointer-events-none absolute -bottom-10 -right-10 size-56 text-primary/[0.06]" strokeWidth={0.7} aria-hidden />
      </header>
      <DashboardView />
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-xl font-medium text-foreground">{value}</dd>
    </div>
  );
}
