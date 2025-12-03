import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/hifdh/'], // Don't index private/admin pages
    },
    sitemap: 'https://atqin.vercel.app/sitemap.xml',
  };
}