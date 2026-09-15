import { NextResponse } from "next/server";
import { getAdminForApi, updateAdminCredentials } from "../../../../cms/admin-auth";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const auth = await getAdminForApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  try {
    const body = await request.json() as {
      currentPassword?: unknown;
      username?: unknown;
      newPassword?: unknown;
      confirmPassword?: unknown;
    };
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const username = typeof body.username === "string" ? body.username : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    if (!currentPassword) throw new Error("Escribe la contraseña actual.");
    if (newPassword !== confirmPassword) throw new Error("Las nuevas contraseñas no coinciden.");
    const result = await updateAdminCredentials({ currentPassword, username, newPassword });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se han podido actualizar las credenciales." },
      { status: 400 },
    );
  }
}
