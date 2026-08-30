import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../cms/admin-auth";
import { listRevisions } from "../../../cms/content-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAdminForApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  return NextResponse.json({ revisions: await listRevisions() });
}
