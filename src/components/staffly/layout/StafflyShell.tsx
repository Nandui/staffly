"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu, Search, Plus, UsersRound, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { can } from "@/lib/permissions";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { selectCenter } from "@/lib/actions/center";
import { ALL_CENTERS, type CenterSummary } from "@/lib/center-shared";
import {
  StafflySidebar,
  navSections,
  type ShellUser,
} from "@/components/staffly/layout/StafflySidebar";

export function StafflyShell({
  centers,
  selectedId,
  user,
  notifCount,
  children,
}: {
  centers: CenterSummary[];
  selectedId: string | null;
  user: ShellUser;
  notifCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const canCreate = can(user, "editContent");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setCmdkOpen(false);
    router.push(href);
  };
  const switchCentre = (id: string) => {
    setCmdkOpen(false);
    void selectCenter(id);
  };
  const navItems = navSections(notifCount).flatMap((s) => s.items);

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-2"
        >
          <Menu className="size-5" />
        </button>
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UsersRound className="size-4" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-ink">
            Staffly
          </span>
        </span>
        <button
          type="button"
          onClick={() => setCmdkOpen(true)}
          aria-label="Search"
          className="ml-auto flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-2"
        >
          <Search className="size-5" />
        </button>
      </header>

      {open && (
        <div
          className="no-print fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <StafflySidebar
        centers={centers}
        selectedId={selectedId}
        user={user}
        notifCount={notifCount}
        open={open}
        onClose={() => setOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="no-print sticky top-0 z-30 hidden h-14 shrink-0 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur md:flex lg:px-8">
          <button
            type="button"
            onClick={() => setCmdkOpen(true)}
            className="group flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-sm text-faint shadow-xs transition-colors hover:text-muted-foreground"
          >
            <Search className="size-4" />
            <span>Search…</span>
            <kbd className="ml-auto inline-flex items-center gap-0.5 rounded border border-line bg-surface-2 px-1.5 font-mono text-[0.7rem] text-faint">
              ⌘K
            </kbd>
          </button>
          {canCreate && (
            <Link
              href="/staffly/staff/new"
              className={cn(buttonClasses({ size: "sm" }), "ml-auto")}
            >
              <Plus className="size-4" /> Add staff
            </Link>
          )}
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <CommandDialog open={cmdkOpen} onOpenChange={setCmdkOpen}>
        <CommandInput placeholder="Search pages, actions, centres…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Go to">
            {navItems.map((item) => (
              <CommandItem
                key={item.href}
                value={`go ${item.label}`}
                onSelect={() => go(item.href)}
              >
                <item.icon />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {canCreate && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem
                  value="add staff member new"
                  onSelect={() => go("/staffly/staff/new")}
                >
                  <Plus />
                  Add staff member
                </CommandItem>
              </CommandGroup>
            </>
          )}
          {centers.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Switch centre">
                <CommandItem
                  value="all centres"
                  onSelect={() => switchCentre(ALL_CENTERS)}
                >
                  <Building2 />
                  All centres
                  {selectedId === null && <Check className="ml-auto" />}
                </CommandItem>
                {centers.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`centre ${c.name}`}
                    onSelect={() => switchCentre(c.id)}
                  >
                    <Building2 />
                    {c.name}
                    {selectedId === c.id && <Check className="ml-auto" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
