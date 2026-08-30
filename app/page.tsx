import { getPublishedSiteContent } from "./cms/content-store";
import { SitePage } from "./site-page";

export { SitePage } from "./site-page";

export default async function Home() {
  return <SitePage content={await getPublishedSiteContent()} />;
}
