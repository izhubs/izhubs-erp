import { db } from '@/core/engine/db';
import { notFound } from 'next/navigation';
import { LandingRenderer, LandingBlock } from '@/components/plugins/izlanding/LandingRenderer';
import type { Metadata } from 'next';
import Script from 'next/script';
import LivePreviewWrapper from '@/components/plugins/izlanding/LivePreviewWrapper';

interface Params {
  domain: string;
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const project = await fetchLandingPage(domain);
  if (!project) return { title: 'Not Found' };
  
  // Extract SEO settings from content_json if available
  let seoTitle = project.name;
  let seoDescription = project.description || '';
  let allowIndexing = true;
  
  try {
    const rawContent = typeof project.content_json === 'string' 
      ? JSON.parse(project.content_json) 
      : project.content_json;
    if (rawContent && rawContent.seoSettings) {
      if (rawContent.seoSettings.seoTitle) seoTitle = rawContent.seoSettings.seoTitle;
      if (rawContent.seoSettings.seoDescription) seoDescription = rawContent.seoSettings.seoDescription;
      if (typeof rawContent.seoSettings.allowIndexing === 'boolean') {
        allowIndexing = rawContent.seoSettings.allowIndexing;
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }
  
  return {
    title: seoTitle,
    description: seoDescription,
    robots: {
      index: allowIndexing,
      follow: allowIndexing,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
    }
  };
}

async function fetchLandingPage(domainOrId: string) {
  // In a real app with subdomains, we'd use middleware to rewrite the URL.
  // Here we use a path /p/[domainOrId]
  const isId = /^\d+$/.test(domainOrId) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(domainOrId);
  
  let result;
  if (isId) {
    result = await db.query(`
      SELECT p.id, p.name, p.description, p.status, p.settings, pg.content_json, pg.tracking_scripts
      FROM iz_landing_projects p
      JOIN iz_landing_pages pg ON pg.project_id = p.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `, [domainOrId]);
  } else {
    result = await db.query(`
      SELECT p.id, p.name, p.description, p.status, p.settings, pg.content_json, pg.tracking_scripts
      FROM iz_landing_projects p
      JOIN iz_landing_pages pg ON pg.project_id = p.id
      WHERE p.active_domain = $1 AND p.deleted_at IS NULL
    `, [domainOrId]);
  }

  return result.rows[0];
}

export default async function PublicLandingPage({
  params,
  searchParams,
}: {
  params: { domain: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { domain } = params;
  const project = await fetchLandingPage(domain);

  if (!project) {
    notFound();
  }

  // Usually we hide drafts, but for preview we can allow it or show a banner
  const isDraft = project.status !== 'published';
  let contentObj: { blocks: LandingBlock[], seoSettings?: any } = { blocks: [] };
  
  try {
    const rawContent = typeof project.content_json === 'string' 
      ? JSON.parse(project.content_json) 
      : project.content_json;
      
    // Handle both old array format and new object format {blocks, seoSettings}
    if (Array.isArray(rawContent)) {
      contentObj.blocks = rawContent;
    } else if (rawContent && typeof rawContent === 'object' && rawContent.blocks) {
      contentObj = rawContent;
    }
  } catch (e) {
    // contentObj remains { blocks: [] }
  }

  const tracking = project.tracking_scripts || {};

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
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

      {/* Tự động chèn JSON-LD Schema để tốt cho SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": project.name,
            "description": project.description || '',
            "url": `https://${domain}`
          })
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .iz-landing-preview { opacity: 0; animation: fadeIn 0.5s ease-in forwards; animation-delay: 0.3s; }
        @keyframes fadeIn { to { opacity: 1; } }
      `}} />

      <div className="iz-landing-preview px-0 overflow-hidden">
       {/* Vùng Render Nội dung bằng LivePreviewWrapper */}
      <LivePreviewWrapper initialBlocks={contentObj.blocks} searchParams={searchParams as Record<string, string>} projectSettings={project.settings} />
      
      {/* Auto-track Page View */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          if (window.__iz_tracked) return;
          window.__iz_tracked = true;
          setTimeout(() => {
            if (window.AOS) window.AOS.init({ once: true, duration: 800, offset: 50 });
            
            fetch('/api/v1/public/plugins/izlanding/analytics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: "${project.id}",
                eventType: "view",
                eventData: {
                  url: window.location.href,
                  referrer: document.referrer,
                  utm_source: new URLSearchParams(window.location.search).get('utm_source'),
                  utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
                }
              })
            }).catch(console.error);
          }, 1000);
        })();
      ` }} />
    </div>
    </>
  );
}
