import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso privado | Tiki Taka Games",
  description: "Área privada de administración de Tiki Taka Games.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
