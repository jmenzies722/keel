import Link from "next/link";
import { brand } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/button";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {brand.productName} · {brand.descriptor}
        </p>
        <h1 className="text-3xl font-medium tracking-tight">Engineering desk</h1>
        <p className="max-w-2xl text-muted-foreground">{brand.tagline}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/learn" className={cn(buttonVariants())}>
            Start learning
          </Link>
          <Link href="/company" className={cn(buttonVariants({ variant: "outline" }))}>
            Enter Northstar
          </Link>
        </div>
      </header>
      <DashboardView />
    </div>
  );
}
