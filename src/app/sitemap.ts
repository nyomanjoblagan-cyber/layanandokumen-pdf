import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pdf.layanandokumen.com';

  // Daftar ID semua tools yang sudah kita buat
  const tools = [
    'merge-pdf', 'split-pdf', 'compress-pdf', 
    'jpg-to-pdf', 'pdf-to-jpg', 'png-to-pdf', 'pdf-to-png',
    'pdf-to-text', 'pdf-to-html', 'scan-pdf',
    'edit-pdf', 'esign-pdf', 'fill-form', 'flatten-pdf',
    'protect-pdf', 'unlock-pdf', 'watermark-pdf',
    'rotate-pdf', 'delete-pages', 'rearrange-pdf',
    'extract-pages', 'resize-pdf', 'add-page-numbers', 'add-image-pdf'
  ];

  // Generate URL untuk setiap tool secara otomatis
  const toolUrls = tools.map((id) => ({
    url: `${baseUrl}/tools/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    // 1. Halaman Depan (Prioritas Tertinggi)
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // 2. Semua Halaman Tools
    ...toolUrls,
    // 3. Halaman Legalitas
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}