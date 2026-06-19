"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings", label: "Organisation" },
  { href: "/settings/certifications", label: "Certifications" },
  { href: "/settings/onboarding", label: "Onboarding" },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="scrollbar-none -mb-px overflow-x-auto border-b border-line">
      <nav className="flex min-w-max gap-1">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-ink",
              )}
            >
              {t.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
