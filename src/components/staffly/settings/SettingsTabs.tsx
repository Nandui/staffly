"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  ShieldCheck,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SettingsCounts {
  centres: number;
  roles: number;
  certTypes: number;
  onboardingSteps: number;
}

const TABS: {
  href: string;
  label: string;
  icon: LucideIcon;
  key: keyof SettingsCounts;
}[] = [
  { href: "/settings", label: "Centres", icon: Building2, key: "centres" },
  { href: "/settings/roles", label: "Roles", icon: Users, key: "roles" },
  {
    href: "/settings/certifications",
    label: "Certifications",
    icon: ShieldCheck,
    key: "certTypes",
  },
  {
    href: "/settings/onboarding",
    label: "Onboarding",
    icon: ClipboardList,
    key: "onboardingSteps",
  },
];

export function SettingsTabs({ counts }: { counts: SettingsCounts }) {
  const pathname = usePathname();

  return (
    <div className="scrollbar-none overflow-x-auto">
      <nav className="flex min-w-max gap-1.5">
        {TABS.map((t) => {
          const active = pathname === t.href;
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-line bg-surface text-ink shadow-xs"
                  : "border-transparent text-muted-foreground hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              {t.label}
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] items-center justify-center rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold tnum",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface-2 text-muted-foreground",
                )}
              >
                {counts[t.key]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
