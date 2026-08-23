"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "./nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const company = pathname.startsWith("/company");

  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <main className={company ? "flex min-h-0 flex-1 flex-col" : "mx-auto w-full max-w-[1400px] flex-1 px-4 py-6"}>
        {children}
      </main>
    </div>
  );
}
