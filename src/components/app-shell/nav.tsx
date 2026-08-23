"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/learn", label: "Learn" },
  { href: "/company", label: "Company" },
  { href: "/labs", label: "Labs" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/interview", label: "Interview" },
  { href: "/portfolio", label: "Portfolio" },
];

export function TopNav() {
  const pathname = usePathname();
  const company = pathname.startsWith("/company");

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4">
        <Link href="/" className="shrink-0 font-medium tracking-tight">
          <span className="text-foreground">{brand.productShortName}</span>
          <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
            {brand.descriptor}
          </span>
        </Link>
        <nav aria-label="Primary" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground",
                  link.label === "Company" && company && "text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
