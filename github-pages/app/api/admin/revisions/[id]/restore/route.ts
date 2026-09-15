import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../cms/admin-auth";
import { restoreRevision } from "../../../../../cms/content-store";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await getAdminForApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  try {
    const { id } = await context.params;
    return NextResponse.json(await restoreRevision(id, auth.user.email));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo recuperar la versión." }, { status: 404 });
  }
}
