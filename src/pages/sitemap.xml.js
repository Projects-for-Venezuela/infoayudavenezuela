import { estados, slug } from "../data/centros";

export async function GET() {
  const siteUrl = "https://infoayudavenezuela.vercel.app";
  const lastmod = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "hourly" },
    { loc: "/emergencia", priority: "0.9", changefreq: "monthly" },
    { loc: "/sobre-nosotros", priority: "0.6", changefreq: "monthly" },
  ];

  const statePages = estados.map((e) => ({
    loc: `/estado/${slug(e.estado)}`,
    priority: "0.8",
    changefreq: "hourly",
  }));

  const allPages = [...staticPages, ...statePages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url>
    <loc>${siteUrl}${page.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}