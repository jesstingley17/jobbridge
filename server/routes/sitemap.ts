import type { Express } from "express";

/**
 * Generate XML sitemap for SEO
 * Lists all public pages on the website
 */
export function registerSitemapRoute(app: Express) {
  const baseUrl = process.env.CLIENT_URL || "https://thejobbridge-inc.com";
  const currentDate = new Date().toISOString().split('T')[0];

  // Define all public pages with their priority and change frequency
  const pages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/features', priority: '0.8', changefreq: 'monthly' },
    { path: '/jobs', priority: '0.9', changefreq: 'daily' },
    { path: '/pricing', priority: '0.7', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/auth', priority: '0.5', changefreq: 'monthly' },
  ];

  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.send(sitemap);
  });

  // Also serve robots.txt
  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /applications/
Disallow: /auth/verify

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.send(robots);
  });
}

