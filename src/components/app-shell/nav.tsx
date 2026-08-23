"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/company", label: "Company" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/skills", label: "Skills" },
];

const PRACTICE_LINKS = [
  { href: "/labs", label: "Labs" },
  { href: "/projects", label: "Projects" },
  { href: "/interview", label: "Interview" },
  { href: "/portfolio", label: "Portfolio" },
];

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-5 px-4">
        <Link href="/" className="group flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid size-8 place-items-center rounded-lg bg-primary font-mono text-sm font-semibold text-primary-foreground shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_20%,transparent)]">
            K
          </span>
          <span>
            <span className="block font-medium leading-none tracking-tight text-foreground">
              {brand.productShortName}
            </span>
            <span className="mt-1 hidden text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
              {brand.descriptor}
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground",
                isActive(link.href) && "bg-muted text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mx-1 h-5 w-px bg-border" />
          {PRACTICE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground",
                isActive(link.href) && "bg-muted text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/learn"
          className="ml-auto hidden rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15 sm:block md:ml-0"
        >
          Continue path
        </Link>

        <button
          type="button"
          className="ml-auto grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Mobile primary" className="border-t border-border/70 bg-background px-4 py-4 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {[...PRIMARY_LINKS, ...PRACTICE_LINKS].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg border border-transparent px-3 py-2.5 text-sm text-muted-foreground",
                  isActive(link.href) ? "border-primary/20 bg-primary/10 text-foreground" : "hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
