import { FolderOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentCard } from "@/components/staffly/documents/DocumentCard";
import { UploadDocButton } from "@/components/staffly/staff/TabAddButtons";
import { getCurrentUser, can } from "@/lib/auth";
import { listDocumentsForStaff } from "@/lib/staffly/data/documents";

export const metadata = { title: "Documents" };

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [docs, user] = await Promise.all([
    listDocumentsForStaff(id),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          Document vault
        </h2>
        {canManage && <UploadDocButton staffId={id} />}
      </div>

      {docs.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents"
          description="Upload contracts, Garda vetting, right-to-work and other records (PDF, image or Word, up to 5MB)."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <DocumentCard key={d.id} doc={d} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}
