import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { getPublishedSiteContent } from "./cms/content-store";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedSiteContent();
  return {
    title: content.seo.title,
    description: content.seo.description,
    icons: {
      icon: [{ url: "/tikitaka-cherry.png", type: "image/png" }],
      shortcut: "/tikitaka-cherry.png",
      apple: "/tikitaka-cherry.png",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
