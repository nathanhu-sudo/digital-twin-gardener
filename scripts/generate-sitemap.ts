// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://smartpantryai.co";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Public, indexable routes only. App pages (/app, /profile, /achievements)
// sit behind sign-in; /auth, /reset-password, /admin and /lovable/* are excluded.
const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/pantry-inventory-app", changefreq: "monthly", priority: "0.9" },
  { path: "/food-waste-app", changefreq: "monthly", priority: "0.9" },
  { path: "/guides", changefreq: "weekly", priority: "0.8" },
  { path: "/guides/how-to-reduce-food-waste-at-home", changefreq: "monthly", priority: "0.7" },
  { path: "/guides/best-pantry-inventory-app-2026", changefreq: "monthly", priority: "0.7" },
  { path: "/guides/pantry-organization-ideas", changefreq: "monthly", priority: "0.7" },
  { path: "/guides/best-food-waste-app-2026", changefreq: "monthly", priority: "0.7" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/refund", changefreq: "yearly", priority: "0.3" },
];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
