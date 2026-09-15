import { LoginForm } from "./login-form";
import "../admin.css";

export default function AdminLoginPage() {
  return <LoginForm returnTo="/admin" />;
}
