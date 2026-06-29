import { SITE_URL } from "../lib/site.js";

export async function GET() {
  const siteUrl = SITE_URL;
  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}