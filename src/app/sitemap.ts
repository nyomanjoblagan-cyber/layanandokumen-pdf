import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pdf-super-app.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    'add-image-pdf', 'add-page-numbers', 'compress-pdf', 'delete-pages',
    'edit-pdf', 'esign-pdf', 'extract-pages', 'fill-form', 'flatten-pdf',
    'jpg-to-pdf', 'merge-pdf', 'pdf-to-html', 'pdf-to-jpg', 'pdf-to-png',
    'pdf-to-text', 'png-to-pdf', 'protect-pdf', 'rearrange-pdf', 'resize-pdf',
    'rotate-pdf', 'scan-pdf', 'split-pdf', 'unlock-pdf', 'watermark-pdf'
  ];

  const toolsSitemap = tools.map((tool) => ({
    url: `${siteUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...toolsSitemap,
  ];
}