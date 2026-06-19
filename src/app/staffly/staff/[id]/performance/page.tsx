import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PerformanceNoteCard } from "@/components/staffly/performance/PerformanceNoteCard";
import { AddNoteButton } from "@/components/staffly/staff/TabAddButtons";
import { getCurrentUser, can } from "@/lib/auth";
import { listPerformanceNotes } from "@/lib/staffly/data/performance";

export const metadata = { title: "Performance" };

export default async function PerformancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [notes, user] = await Promise.all([
    listPerformanceNotes(id),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          Performance notes
        </h2>
        {canManage && <AddNoteButton staffId={id} />}
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No notes yet"
          description="Record positive feedback, concerns, objectives or review notes for this staff member."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <PerformanceNoteCard key={n.id} note={n} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}
