import { Metadata } from 'next'
import { Header } from '@/components/landing/header'
import { HeroSection } from '@/components/landing/hero-section'
import { GallerySection } from '@/components/landing/gallery-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { CTASection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'AI Video Generator - Create Videos with Sora 2 & Veo 3 | Blacktools AI',
  description: 'Generate professional AI videos instantly with Sora 2, Veo 3.1, LipSync, and 300+ AI avatars. No watermarks, bulk generation, API access. Start free with 50 credits.',
  keywords: [
    'ai video generator',
    'sora 2 video generator',
    'veo 3 video generator',
    'text to video ai',
    'ai video maker online',
    'lipsync ai',
    'ai avatar generator',
    'ugc video generator',
    'tiktok video generator ai',
    'ai ads generator',
    'bulk video generation',
    'ai video api',
    'free ai video generator',
    'ai video generator no watermark',
    'best ai video generator 2024',
    'ai video generator for marketing',
    'create ai videos',
    'ai video creation tool',
    'text to video generator',
    'ai talking avatar',
  ],
  openGraph: {
    type: 'website',
    title: 'AI Video Generator - Create Videos with Sora 2 & Veo 3 | Blacktools AI',
    description: 'Generate professional AI videos instantly with Sora 2, Veo 3.1, LipSync, and 300+ AI avatars. No watermarks, bulk generation. Start free!',
    url: 'https://blacktools.ai',
    siteName: 'Blacktools AI',
    images: [
      {
        url: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/banner.webp',
        width: 1200,
        height: 630,
        alt: 'Blacktools AI - AI Video Generator with Sora 2 and Veo 3',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video Generator - Sora 2 & Veo 3 | Blacktools AI',
    description: 'Create professional AI videos with Sora 2, Veo 3.1, LipSync. No watermarks, bulk generation. Start free!',
    images: ['https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/banner.webp'],
  },
  alternates: {
    canonical: 'https://blacktools.ai',
  },
}

export default function HomePage() {
  // Main software application schema
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Blacktools AI',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    url: 'https://blacktools.ai',
    description: 'AI-powered video generation platform with Sora 2, Veo 3.1, LipSync, and 300+ AI avatars. Create professional marketing videos in minutes.',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '59.50',
      priceCurrency: 'USD',
      offerCount: '4',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Trial',
          price: '0',
          priceCurrency: 'USD',
          description: '50 free credits to try all features',
        },
        {
          '@type': 'Offer',
          name: 'Starter Plan',
          price: '24.50',
          priceCurrency: 'USD',
          description: 'Perfect for individuals starting with AI video',
        },
        {
          '@type': 'Offer',
          name: 'Pro Plan',
          price: '39.50',
          priceCurrency: 'USD',
          description: 'For professionals and content creators',
        },
        {
          '@type': 'Offer',
          name: 'Premium Plan',
          price: '59.50',
          priceCurrency: 'USD',
          description: 'Unlimited access for agencies and teams',
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      ratingCount: '2847',
      reviewCount: '1523',
    },
    featureList: [
      'Sora 2 Text to Video Generation',
      'Veo 3.1 High-Fidelity Video',
      'Advanced LipSync Technology',
      '300+ AI Avatars',
      'Infinite Talk Voiceovers',
      'Bulk Video Generation',
      'No Watermarks',
      'API Access',
      '4K Video Export',
    ],
    screenshot: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/banner.webp',
  }

  // FAQ schema for rich snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Blacktools AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Blacktools AI is an all-in-one AI video generation platform that combines Sora 2, Veo 3.1, LipSync technology, and over 300 AI avatars. It allows you to create professional marketing videos, UGC content, and ads without any technical skills or watermarks.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Sora 2 video generation work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sora 2 is an advanced AI model that generates high-quality videos from text prompts. Simply describe what you want to see, choose duration and aspect ratio, and Sora 2 creates realistic video content in minutes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a free trial available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Blacktools AI offers 50 free credits when you sign up, no credit card required. This allows you to try all features including Sora 2, Veo 3, LipSync, and AI avatars before subscribing.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I generate videos without watermarks?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! All videos generated with Blacktools AI are completely watermark-free, ready for commercial use on TikTok, Instagram, YouTube, and any other platform.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is bulk video generation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bulk generation allows you to create multiple videos simultaneously. Run Sora 2, Veo 3, and LipSync generations at the same time, saving hours of work for marketing campaigns.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Blacktools AI have an API?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Blacktools AI provides API access for developers and businesses to integrate AI video generation directly into their applications and workflows.',
        },
      },
    ],
  }

  // WebSite schema for sitelinks search box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Blacktools AI',
    url: 'https://blacktools.ai',
    description: 'AI Video Generator with Sora 2, Veo 3, LipSync and 300+ AI Avatars',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://blacktools.ai/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://blacktools.ai',
      },
    ],
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
        <Header />
        <main>
          <HeroSection />
          <GallerySection />
          <HowItWorksSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  )
}
