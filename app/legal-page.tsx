"use client";

import { useEffect, useState } from "react";
import { AnalyticsConsent } from "./analytics-consent";
import { DEFAULT_SITE_CONTENT } from "./cms/default-content";
import { getPublishedContentFromSupabase } from "./cms/supabase-public";
import type { SiteContent } from "./cms/types";

export type LegalPageKind = "aviso-legal" | "privacidad" | "cookies";

type LegalContent = SiteContent["legal"];

function InternalLink({ href, children, assetBase }: { href: string; children: React.ReactNode; assetBase: string }) {
  return <a href={`${assetBase}${href}/`}>{children}</a>;
}

function LegalNotice({ legal }: { legal: LegalContent }) {
  return <>
    <section><h2>1. Titular del sitio web</h2><p>Este sitio web es titularidad de <strong>{legal.companyName}</strong>, con NIF <strong>{legal.taxId}</strong> y domicilio en {legal.address}.</p><ul><li>{legal.registry}</li><li>Teléfono: <a href={`tel:${legal.phone.replace(/\s/g, "")}`}>{legal.phone}</a></li><li>Correo electrónico: <a href={`mailto:${legal.email}`}>{legal.email}</a></li></ul></section>
    <section><h2>2. Objeto</h2><p>El sitio ofrece información corporativa sobre Tiki Taka Games, sus áreas de actividad, salones, servicios, oportunidades de empleo y canales de contacto. El acceso implica la aceptación de las condiciones incluidas en este aviso.</p></section>
    <section><h2>3. Uso del sitio</h2><p>La persona usuaria se compromete a utilizar la web de forma lícita, diligente y respetuosa con los derechos de terceros. Queda prohibido introducir código malicioso, intentar acceder a zonas restringidas o emplear los contenidos con fines contrarios a la ley.</p></section>
    <section><h2>4. Propiedad intelectual e industrial</h2><p>Los diseños, textos, fotografías, vídeos, marcas, logotipos y demás elementos del sitio pertenecen a Tiki Taka Games o se utilizan con autorización. Su reproducción, transformación, distribución o explotación requiere autorización previa, salvo los usos permitidos por la ley.</p></section>
    <section><h2>5. Contenidos y disponibilidad</h2><p>Tiki Taka Games procura que la información sea exacta y que el servicio esté disponible, aunque pueden producirse errores, interrupciones o cambios. La empresa podrá actualizar, modificar o retirar contenidos cuando resulte necesario.</p></section>
    <section><h2>6. Enlaces externos</h2><p>La web puede incluir enlaces a servicios de terceros. Cada sitio externo aplica sus propias condiciones y políticas; Tiki Taka Games no controla sus contenidos ni su disponibilidad.</p></section>
    <section><h2>7. Legislación aplicable</h2><p>Este sitio se rige por la legislación española. Cualquier controversia se someterá a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable, respetando en todo caso los derechos de consumidores y usuarios.</p></section>
  </>;
}

function PrivacyPolicy({ legal }: { legal: LegalContent }) {
  return <>
    <section><h2>1. Responsable del tratamiento</h2><p><strong>{legal.companyName}</strong> · NIF {legal.taxId} · {legal.address} · <a href={`mailto:${legal.email}`}>{legal.email}</a> · <a href={`tel:${legal.phone.replace(/\s/g, "")}`}>{legal.phone}</a>.</p><p>Contacto de privacidad: <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>. Delegado de Protección de Datos: <strong>{legal.dpoName}</strong>, NIF {legal.dpoTaxId}, <a href={`mailto:${legal.dpoEmail}`}>{legal.dpoEmail}</a>.</p></section>
    <section><h2>2. Datos, finalidades y bases jurídicas</h2><div className="legal-table-wrap"><table><thead><tr><th>Tratamiento</th><th>Datos</th><th>Finalidad y base jurídica</th></tr></thead><tbody><tr><td>Contactos</td><td>{legal.dataCategories}</td><td>{legal.contactPurpose} La base jurídica es el consentimiento o la relación mantenida con la persona interesada o su organización.</td></tr><tr><td>Procedencia</td><td colSpan={2}>{legal.dataSource}</td></tr><tr><td>Analítica web</td><td>Identificador en línea, dispositivo, navegación y ubicación aproximada</td><td>Medir el uso y mejorar la web; consentimiento, que puede retirarse en cualquier momento.</td></tr><tr><td>Obligaciones y seguridad</td><td>Datos necesarios para acreditar actuaciones e incidencias</td><td>Cumplimiento legal e interés legítimo en proteger el sitio y ejercer o defender reclamaciones.</td></tr></tbody></table></div><p>Las candidaturas de empleo se gestionan desde la plataforma enlazada en la sección «Empleo», que muestra su propia información de privacidad antes de recoger datos.</p></section>
    <section><h2>3. Destinatarios y proveedores</h2><p>Los datos no se venden. Podrán acceder a ellos proveedores que prestan servicios de alojamiento, soporte, seguridad o analítica bajo contrato, además de administraciones y autoridades cuando exista una obligación legal.</p><p>Google Analytics se activa únicamente con autorización. Google puede tratar datos en países fuera del Espacio Económico Europeo aplicando los mecanismos y garantías previstos en su documentación de privacidad.</p></section>
    <section><h2>4. Conservación</h2><p>Los datos se conservarán durante el tiempo necesario para atender la finalidad correspondiente y, después, durante los plazos exigidos para cumplir obligaciones o atender posibles responsabilidades. La preferencia de cookies permanece en el navegador hasta que se elimina o modifica. La duración de las cookies analíticas figura en la Política de cookies.</p></section>
    <section><h2>5. Derechos</h2><p>{legal.rightsText} Para ejercerlos o solicitar más información, escribe a <a href={`mailto:${legal.dpoEmail}`}>{legal.dpoEmail}</a> o a la dirección postal indicada. La solicitud debe permitir verificar tu identidad y concretar el derecho ejercitado.</p><p>También puedes reclamar ante la <a href="https://www.aepd.es/" target="_blank" rel="noreferrer">Agencia Española de Protección de Datos</a>.</p></section>
    <section><h2>6. Actualizaciones</h2><p>Esta política podrá actualizarse para reflejar cambios normativos o en los tratamientos. La fecha de la versión vigente aparece al comienzo de la página.</p></section>
  </>;
}

function CookiePolicy() {
  return <>
    <section><h2>1. Qué utilizamos</h2><p>La web guarda una preferencia técnica en el almacenamiento local del navegador y, únicamente si das tu consentimiento, activa Google Analytics 4 para conocer de forma agregada cómo se utiliza el sitio.</p></section>
    <section><h2>2. Detalle de tecnologías</h2><div className="legal-table-wrap"><table><thead><tr><th>Nombre</th><th>Proveedor</th><th>Finalidad</th><th>Duración</th></tr></thead><tbody><tr><td><code>tikitaka-analytics-consent</code></td><td>Tiki Taka Games</td><td>Recordar si se han aceptado o rechazado las cookies analíticas. Es almacenamiento local necesario para respetar la elección.</td><td>Hasta que se borre o cambie la preferencia</td></tr><tr><td><code>_ga</code></td><td>Google Analytics</td><td>Distinguir usuarios mediante un identificador aleatorio.</td><td>2 años</td></tr><tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Conservar el estado de la sesión.</td><td>2 años</td></tr></tbody></table></div><p>La duración efectiva puede verse limitada por el navegador. La web mantiene denegado el almacenamiento publicitario y no activa Analytics antes de obtener el consentimiento.</p></section>
    <section><h2>3. Cómo elegir o retirar el consentimiento</h2><p>Al entrar puedes aceptar, rechazar o configurar las cookies analíticas con el mismo nivel de facilidad. Después puedes cambiar la decisión desde el botón <strong>Cookies</strong> situado en la esquina inferior izquierda.</p><p>También puedes borrar cookies y almacenamiento local desde la configuración del navegador. Al hacerlo, volveremos a solicitar tu elección.</p></section>
    <section><h2>4. Información sobre Google Analytics</h2><p>Google Analytics puede recoger estadísticas de sesión, páginas visitadas, información del navegador y dispositivo, y ubicación aproximada. Consulta la <a href="https://policies.google.com/privacy?hl=es" target="_blank" rel="noreferrer">política de privacidad de Google</a> para conocer su tratamiento.</p></section>
    <section><h2>5. Actualizaciones</h2><p>Revisaremos esta política cuando cambien las tecnologías utilizadas o los requisitos aplicables. La fecha superior identifica la versión vigente.</p></section>
  </>;
}

const pageInfo = {
  "aviso-legal": { eyebrow: "Información corporativa", title: "Aviso legal", intro: "Identificación del titular y condiciones de uso de la web." },
  privacidad: { eyebrow: "Protección de datos", title: "Política de privacidad", intro: "Información clara sobre cómo tratamos y protegemos los datos personales." },
  cookies: { eyebrow: "Preferencias de navegación", title: "Política de cookies", intro: "Tecnologías utilizadas, finalidad y control de tus preferencias." },
};

export function LegalPage({ kind, assetBase = "/" }: { kind: LegalPageKind; assetBase?: string }) {
  const page = pageInfo[kind];
  const [legal, setLegal] = useState<LegalContent>(() => structuredClone(DEFAULT_SITE_CONTENT.legal));
  useEffect(() => { getPublishedContentFromSupabase().then((content) => setLegal(content.legal)).catch(() => undefined); }, []);
  const content = kind === "aviso-legal" ? <LegalNotice legal={legal} /> : kind === "privacidad" ? <PrivacyPolicy legal={legal} /> : <CookiePolicy />;
  return <>
    <a className="skip-link" href="#contenido-legal">Saltar al contenido</a>
    <header className="legal-header"><a className="legal-logo" href={assetBase} aria-label="Volver a Tiki Taka Games"><span>TIKI TAKA</span><small>GAMES</small></a><a className="legal-back" href={assetBase}>Volver a la web <b>↗</b></a></header>
    <main id="contenido-legal" className="legal-page">
      <div className="legal-hero"><p>{page.eyebrow}</p><h1>{page.title}</h1><span>{page.intro}</span><small>Última actualización: {legal.updatedAt}</small></div>
      <article className="legal-content">{content}</article>
    </main>
    <footer className="legal-footer"><strong>TIKI TAKA GAMES</strong><nav aria-label="Páginas legales"><InternalLink assetBase={assetBase} href="aviso-legal">Aviso legal</InternalLink><InternalLink assetBase={assetBase} href="privacidad">Privacidad</InternalLink><InternalLink assetBase={assetBase} href="cookies">Cookies</InternalLink></nav><span>© 2026 · Juega con responsabilidad · +18</span></footer>
    <AnalyticsConsent assetBase={assetBase} />
  </>;
}
