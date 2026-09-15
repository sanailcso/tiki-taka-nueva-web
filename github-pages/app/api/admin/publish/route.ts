import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../cms/admin-auth";
import { publishDraft } from "../../../cms/content-store";

export async function POST() {
  const auth = await getAdminForApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  try {
    return NextResponse.json(await publishDraft(auth.user.email));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo publicar." }, { status: 500 });
  }
}
