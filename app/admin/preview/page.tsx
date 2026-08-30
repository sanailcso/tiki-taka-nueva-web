import { requireAdmin } from "../../cms/admin-auth";
import { getDraftSiteContent } from "../../cms/content-store";
import { SitePage } from "../../page";
import "../admin.css";

export const dynamic = "force-dynamic";

export default async function DraftPreviewPage() {
  await requireAdmin("/admin/preview");
  const { content } = await getDraftSiteContent();
  return (
    <>
      <div className="draft-preview-bar"><strong>Vista previa del borrador</strong><a href="/admin">Volver al backoffice</a></div>
      <SitePage content={content} />
    </>
  );
}
