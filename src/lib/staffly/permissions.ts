// Staffly maps onto Riskly's shared role model (Viewer → Admin). Write access
// follows "editContent"; settings (roles, cert types) follow "admin".
import { can } from "@/lib/permissions";

type U = { role: string } | null | undefined;

export const canViewStaffly = (u: U) => can(u, "view");
export const canManageStaffly = (u: U) => can(u, "editContent");
export const canAdminStaffly = (u: U) => can(u, "admin");
