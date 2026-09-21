import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Aviso legal | Tiki Taka Games", description: "Identificación del titular y condiciones de uso de la web de Tiki Taka Games.", alternates: { canonical: "https://www.tikitaka.es/aviso-legal/" } };
export default function Page() { return <LegalPage kind="aviso-legal" />; }
