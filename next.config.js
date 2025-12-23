/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'auth.blacktools.ai',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Increase body size limit for server actions (fallback if direct upload fails)
  experimental: {
    serverActions: {
      bodySizeLimit: '150mb',
    },
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      }
    ]

    const corsHeaders = [
      {
        key: 'Access-Control-Allow-Origin',
        // In production, always require NEXT_PUBLIC_APP_URL to be set
        // Fallback to '*' only in development
        value: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? '' : '*')
      },
      {
        key: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, DELETE, OPTIONS'
      },
      {
        key: 'Access-Control-Allow-Headers',
        value: 'Content-Type, Authorization'
      },
      {
        key: 'Access-Control-Max-Age',
        value: '86400'
      }
    ]

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        headers: [...securityHeaders, ...corsHeaders],
      },
    ]
  },
}

module.exports = nextConfig
