import { redirect } from "next/navigation";
import { getAdminSession } from "../../cms/admin-auth";
import { LoginForm } from "./login-form";
import "../admin.css";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const params = await searchParams;
  const returnTo = params.returnTo?.startsWith("/admin") && !params.returnTo.startsWith("//") ? params.returnTo : "/admin";
  return <LoginForm returnTo={returnTo} />;
}
