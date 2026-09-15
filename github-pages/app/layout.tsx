import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { getPublishedSiteContent } from "./cms/content-store";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedSiteContent();
  const canonicalUrl = "https://www.tikitaka.es/";
  const socialImage = "https://www.tikitaka.es/wp-content/uploads/2026/04/cropped-Logo-blanco-2-lineas-1.png";
  return {
    metadataBase: new URL(canonicalUrl),
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: canonicalUrl,
      siteName: "Tiki Taka Games",
      title: content.seo.title,
      description: content.seo.description,
      images: [{ url: socialImage, width: 1080, height: 616, alt: "Tiki Taka Games" }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo.title,
      description: content.seo.description,
      images: [socialImage],
    },
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
