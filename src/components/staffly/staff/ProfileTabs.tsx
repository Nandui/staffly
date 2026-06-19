"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { seg: "overview", label: "Overview" },
  { seg: "absence", label: "Absence" },
  { seg: "performance", label: "Performance" },
  { seg: "disciplinary", label: "Disciplinary" },
  { seg: "documents", label: "Documents" },
  { seg: "certifications", label: "Certifications" },
  { seg: "training", label: "Training" },
  { seg: "timeline", label: "Timeline" },
];

export function ProfileTabs({ staffId }: { staffId: string }) {
  const pathname = usePathname();
  const base = `/staffly/staff/${staffId}`;

  return (
    <div className="scrollbar-none -mb-px overflow-x-auto border-b border-line">
      <nav className="flex min-w-max gap-1">
        {TABS.map((t) => {
          const href = `${base}/${t.seg}`;
          const active = pathname === href;
          return (
            <Link
              key={t.seg}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-ink",
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
