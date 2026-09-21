import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Política de privacidad | Tiki Taka Games", description: "Información sobre el tratamiento y la protección de datos personales en Tiki Taka Games.", alternates: { canonical: "https://www.tikitaka.es/privacidad/" } };
export default function Page() { return <LegalPage kind="privacidad" />; }
