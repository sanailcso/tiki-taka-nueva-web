import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../cms/admin-auth";
import { getDraftSiteContent, saveDraft } from "../../../cms/content-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAdminForApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  return NextResponse.json(await getDraftSiteContent());
}

export async function PUT(request: Request) {
  const auth = await getAdminForApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  try {
    const body = await request.json();
    return NextResponse.json(await saveDraft(body.content, auth.user.email));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo guardar el borrador." }, { status: 400 });
  }
}
