import Link from "next/link";
import { brand } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SPINE = [
  { href: "/learn/computing-foundations/representation", label: "Data representation" },
  { href: "/learn/linux-os/processes", label: "Linux processes" },
  { href: "/learn/networking/dns", label: "DNS" },
  { href: "/learn/kubernetes/workloads", label: "Kubernetes workloads" },
  { href: "/learn/model-serving/vllm", label: "vLLM / KV cache" },
] as const;

export default function Home() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {brand.productName} · {brand.descriptor}
        </p>
        <h1 className="text-3xl font-medium tracking-tight">Engineering desk</h1>
        <p className="max-w-2xl text-muted-foreground">{brand.tagline}</p>
        <p className="max-w-2xl text-sm text-muted-foreground">{brand.description}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/learn" className={cn(buttonVariants())}>
            Start learning
          </Link>
          <Link href="/company" className={cn(buttonVariants({ variant: "outline" }))}>
            Enter Northstar
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg p-5 ring-1 ring-foreground/10">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Learn</p>
          <h2 className="mt-1 text-lg font-medium">Authored spine</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
            {SPINE.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </article>
        <article className="rounded-lg p-5 ring-1 ring-foreground/10">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Company</p>
          <h2 className="mt-1 text-lg font-medium">Northstar Systems</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Operate the same skills as production incidents. Opening a page is not evidence.
          </p>
          <Link href="/company" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
            Open the desk
          </Link>
        </article>
      </section>
    </div>
  );
}
