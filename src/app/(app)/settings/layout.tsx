import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { SettingsTabs } from "@/components/staffly/settings/SettingsTabs";
import { getCurrentUser, can } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const canManage = can(user, "admin");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Configure the organisation, compliance catalogue and the new-starter journey."
      />

      {!canManage && (
        <div className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
          You have read-only access. Administrators can manage these settings.
        </div>
      )}

      <SettingsTabs />

      <div>{children}</div>
    </div>
  );
}
