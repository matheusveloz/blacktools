import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/settings/',
          '/login',
          '/signup',
          '/auth/',
          '/buy-credits/',
          '/maintenance',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/settings/',
          '/login',
          '/signup',
          '/auth/',
          '/buy-credits/',
          '/maintenance',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/settings/',
          '/login',
          '/signup',
          '/auth/',
          '/buy-credits/',
          '/maintenance',
        ],
      },
    ],
    sitemap: 'https://blacktools.ai/sitemap.xml',
    host: 'https://blacktools.ai',
  }
}
