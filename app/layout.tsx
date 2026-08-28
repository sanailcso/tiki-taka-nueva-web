import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tiki Taka Games · Nueva web",
  description:
    "Propuesta de nueva web corporativa para Grupo Tiki Taka Games, más de 50 años creando experiencias de ocio.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
