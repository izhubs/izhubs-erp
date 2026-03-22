import { db } from '@/core/engine/db';
import { notFound } from 'next/navigation';
import { LandingRenderer, LandingBlock } from '@/components/plugins/izlanding/LandingRenderer';
import { Metadata } from 'next';
import Script from 'next/script';

interface Params {
  domain: string;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { domain } = await params;
  const project = await fetchLandingPage(domain);
  if (!project) return { title: 'Not Found' };
  
  return {
    title: project.name,
    description: project.description,
  };
}

async function fetchLandingPage(domainOrId: string) {
  // In a real app with subdomains, we'd use middleware to rewrite the URL.
  // Here we use a path /p/[domainOrId]
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(domainOrId);
  
  let result;
  if (isUUID) {
    result = await db.query(`
      SELECT p.id, p.name, p.description, p.status, pg.content_json, pg.tracking_scripts
      FROM iz_landing_projects p
      JOIN iz_landing_pages pg ON pg.project_id = p.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `, [domainOrId]);
  } else {
    result = await db.query(`
      SELECT p.id, p.name, p.description, p.status, pg.content_json, pg.tracking_scripts
      FROM iz_landing_projects p
      JOIN iz_landing_pages pg ON pg.project_id = p.id
      WHERE p.active_domain = $1 AND p.deleted_at IS NULL
    `, [domainOrId]);
  }

  return result.rows[0];
}

export default async function PublicLandingPage({ params }: { params: Params }) {
  const { domain } = await params;
  const project = await fetchLandingPage(domain);

  if (!project) {
    notFound();
  }

  // Usually we hide drafts, but for preview we can allow it or show a banner
  const isDraft = project.status !== 'published';
  let blocks: LandingBlock[] = [];
  
  try {
    const rawContent = typeof project.content_json === 'string' 
      ? JSON.parse(project.content_json) 
      : project.content_json;
      
    blocks = Array.isArray(rawContent) ? rawContent : [];
  } catch (e) {
    blocks = [];
  }

  const tracking = project.tracking_scripts || {};

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      {tracking.customHeadScripts && (
        <script dangerouslySetInnerHTML={{ __html: tracking.customHeadScripts }} />
      )}
      {tracking.facebookPixelId && (
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${tracking.facebookPixelId}');
          fbq('track', 'PageView');
        ` }} />
      )}
      {tracking.googleAnalyticsId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${tracking.googleAnalyticsId}`} />
          <script dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${tracking.googleAnalyticsId}');
          ` }} />
        </>
      )}

      {isDraft && (
        <div className="bg-amber-100 text-amber-800 text-center py-2 text-sm font-semibold sticky top-0 z-50 shadow-sm border-b border-amber-200">
          ⚠️ Đây là bản xem trước (Preview). Landing Page này đang ở trạng thái Draft / Archived.
        </div>
      )}

      <LandingRenderer blocks={blocks} />
    </>
  );
}
