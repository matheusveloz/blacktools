import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { PixelScripts } from '@/components/tracking/pixel-scripts'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://blacktools.ai'),
  title: {
    default: 'Blacktools AI - Create Videos with AI, No Complexity',
    template: '%s | Blacktools AI',
  },
  description: 'Turn your ideas into professional videos using Sora 2, Veo 3.1, LipSync and more. Bulk generation, no watermarks, all tools in one place.',
  keywords: ['ai video generator', 'sora 2', 'veo 3', 'lipsync ai', 'text to video', 'ai video maker', 'bulk video generation', 'tiktok video generator', 'reels maker'],
  authors: [{ name: 'Blacktools AI' }],
  creator: 'Blacktools AI',
  publisher: 'Blacktools AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/logo.png',
    apple: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://blacktools.ai',
    siteName: 'blacktools.ai',
    title: 'blacktools.ai - Create Videos with AI, No Complexity',
    description: 'Turn your ideas into professional videos using Sora 2, Veo 3.1, LipSync and more. Bulk generation, no watermarks.',
    images: [
      {
        url: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/banner.webp',
        width: 1200,
        height: 630,
        alt: 'blacktools.ai - AI Video Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'blacktools.ai - Create Videos with AI',
    description: 'Turn your ideas into professional videos using Sora 2, Veo 3.1, LipSync and more.',
    images: ['https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/banner.webp'],
  },
  alternates: {
    canonical: 'https://blacktools.ai',
  },
  category: 'technology',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#050505',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'blacktools.ai',
    url: 'https://blacktools.ai',
    logo: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/logo.png',
    description: 'AI video generation platform for UGC ads and marketing content. Create professional videos with Sora 2, Veo 3.1, and advanced lip-sync technology.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/blacktoolsai',
      'https://linkedin.com/company/blacktoolsai',
      'https://youtube.com/@blacktoolsai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@blacktools.ai',
    },
  }

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'blacktools.ai',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    description: 'AI UGC video generator with Sora 2, Veo 3.1, 300+ AI avatars, and advanced lip-sync technology. Create professional marketing videos in minutes.',
    url: 'https://blacktools.ai',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '24.50',
      highPrice: '59.50',
      priceCurrency: 'USD',
      offerCount: '3',
    },
    featureList: [
      'AI UGC video generation',
      '300+ hyper-realistic AI avatars',
      'Sora 2 text-to-video integration',
      'Veo 3.1 video synthesis',
      'Advanced lip-sync in 30+ languages',
      'Batch processing and bulk creation',
      '4K video export',
      'API access for developers',
    ],
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Rewardful Affiliate Tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`
          }}
        />
        <script async src="https://r.wdfl.co/rw.js" data-rewardful="4f9ee2" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
        <PixelScripts />
      </body>
    </html>
  )
}
