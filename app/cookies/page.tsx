import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Política de cookies | Tiki Taka Games", description: "Información sobre las cookies, Google Analytics y tus preferencias de privacidad.", alternates: { canonical: "https://www.tikitaka.es/cookies/" } };
export default function Page() { return <LegalPage kind="cookies" />; }
