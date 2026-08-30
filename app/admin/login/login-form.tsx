"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ returnTo }: { returnTo: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password, returnTo }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se ha podido iniciar sesión.");
      window.location.assign(result.returnTo || "/admin");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se ha podido iniciar sesión.");
      setBusy(false);
    }
  }

  return <main className="cms-login">
    <div className="cms-login-atmosphere" aria-hidden="true"><i /><i /><i /></div>
    <section className="cms-login-card">
      <div className="cms-login-brand"><span className="cms-mark">TT</span><div><strong>Tiki Taka</strong><small>Backoffice profesional</small></div></div>
      <div className="cms-login-heading">
        <span>Acceso privado</span>
        <h1>Todo el control de la web, en un solo lugar.</h1>
        <p>Gestiona contenido, multimedia, salones y publicaciones con una sesión segura.</p>
      </div>
      <form onSubmit={submit}>
        <label><span>Usuario</span><div><UserRound /><Input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} autoFocus /></div></label>
        <label><span>Contraseña</span><div><LockKeyhole /><Input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
        {error && <p className="cms-login-error" role="alert">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <LockKeyhole />}{busy ? "Comprobando…" : "Entrar al backoffice"}</Button>
      </form>
      <small className="cms-login-note">La sesión se cierra automáticamente tras 12 horas. Los intentos repetidos se bloquean temporalmente.</small>
    </section>
  </main>;
}
