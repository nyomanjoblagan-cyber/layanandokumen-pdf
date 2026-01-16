import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Jaga-jaga jika nanti ada folder private
    },
    sitemap: 'https://pdf.layanandokumen.com/sitemap.xml',
  }
}