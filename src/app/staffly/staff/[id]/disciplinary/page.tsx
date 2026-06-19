import Link from "next/link";
import { Gavel, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { DisciplinaryCard } from "@/components/staffly/disciplinary/DisciplinaryCard";
import { getCurrentUser, can } from "@/lib/auth";
import { listDisciplinary } from "@/lib/staffly/data/disciplinary";

export const metadata = { title: "Disciplinary" };

export default async function DisciplinaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [records, user] = await Promise.all([
    listDisciplinary(id),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          Disciplinary records
        </h2>
        {canManage && (
          <Link
            href={`/staffly/staff/${id}/disciplinary/new`}
            className={buttonClasses({ size: "sm" })}
          >
            <Plus className="size-4" /> Add disciplinary
          </Link>
        )}
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No disciplinary records"
          description="Formal records, from verbal warnings through to dismissal, will appear here."
          action={
            canManage ? (
              <Link
                href={`/staffly/staff/${id}/disciplinary/new`}
                className={buttonClasses()}
              >
                <Plus className="size-4" /> Add disciplinary
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <DisciplinaryCard key={r.id} record={r} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}
