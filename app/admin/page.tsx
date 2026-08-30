import { requireAdmin } from "../cms/admin-auth";
import { getDraftSiteContent, listMedia, listRevisions } from "../cms/content-store";
import { AdminShell } from "./admin-shell";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdmin("/admin");
  const [draft, revisions, media] = await Promise.all([getDraftSiteContent(), listRevisions(), listMedia()]);
  return <AdminShell initial={draft} revisions={revisions} media={media} userName={user.displayName} />;
}
