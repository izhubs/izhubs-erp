export const dynamic = 'force-dynamic';
import type { MetadataRoute } from 'next';
import { db } from '@/core/engine/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Lấy các Landing page đã published
  const result = await db.query(
    `SELECT id, active_domain, updated_at 
     FROM landing_projects 
     WHERE status = 'published'`
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://izhubs.com';
  const defaultDomain = process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'izhubs.com';

  const sitemaps = result.rows.map(item => {
    const canonicalURL = item.active_domain 
      ? `https://${item.active_domain}` 
      : `https://${item.id}.${defaultDomain}`;

    return {
      url: canonicalURL,
      lastModified: item.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Gắn thêm sitemap của các landing templates
    ...sitemaps
  ];
}
