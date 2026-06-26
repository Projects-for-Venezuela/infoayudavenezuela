export async function GET() {
  const siteUrl = "https://infoayudavenezuela.vercel.app";
  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}