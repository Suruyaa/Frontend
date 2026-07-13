import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/checkout/', '/profile/', '/orders/'],
    },
    sitemap: 'https://www.techtoko.my.id/sitemap.xml',
  };
}
