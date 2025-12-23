import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShoppingCart, Package, Users, Layers, TrendingUp, Store } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Video for E-Commerce - Product Videos & Ads | blacktools.ai',
  description: 'Create e-commerce videos with AI. Product demos, testimonials, TikTok Shop content, Amazon videos. Scale your store content without filming. Try free.',
  keywords: 'AI e-commerce video, product video AI, Shopify video, Amazon product video, TikTok Shop AI',
  alternates: {
    canonical: 'https://blacktools.ai/industries/ecommerce',
  },
  openGraph: {
    title: 'AI Video for E-Commerce - Product Videos & Ads',
    description: 'Create e-commerce videos with AI. Product demos, testimonials, TikTok Shop content.',
    url: 'https://blacktools.ai/industries/ecommerce',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video for E-Commerce - Product Videos & Ads',
    description: 'Create e-commerce videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const whyVideo = {
  stats: [
    'Product pages with video convert 80% better',
    'Video ads outperform static by 2-3x',
    'UGC increases trust and purchase intent',
  ],
  challenges: [
    'Filming every product is expensive',
    "Hiring creators doesn't scale",
    'Seasonal inventory changes constantly',
  ],
}

const videoTypes = [
  { title: 'Product Demos', description: 'Show features, size, and quality with AI presenters.' },
  { title: 'Customer Testimonials', description: 'AI avatars sharing authentic product experiences.' },
  { title: 'Unboxing Videos', description: 'First impressions and reaction content.' },
  { title: 'How-To Content', description: 'Tutorials featuring your products.' },
  { title: 'Comparison Videos', description: 'Your product vs competitors.' },
  { title: 'TikTok Shop Content', description: 'Native vertical videos for social commerce.' },
]

const platforms = [
  { name: 'Shopify', description: 'Generate videos for your entire catalog. Embed on product pages.' },
  { name: 'Amazon', description: 'Create A+ content and video ads at scale.' },
  { name: 'TikTok Shop', description: 'UGC-style content that drives social commerce sales.' },
  { name: 'Meta Ads', description: 'Product ads for Facebook and Instagram.' },
]

const faqs = [
  {
    question: 'How can AI help my e-commerce store?',
    answer: 'blacktools.ai creates product videos at scale. Generate demos, testimonials, and ads from product URLs—no filming required. Stores report increased conversions and engagement with AI video content.',
  },
  {
    question: 'Can I create videos for my entire catalog?',
    answer: 'Yes. Upload a CSV with product URLs and generate videos in bulk. This is perfect for stores with hundreds or thousands of SKUs.',
  },
  {
    question: 'What video formats work best for e-commerce?',
    answer: 'Product demos and testimonials drive the most conversions on product pages. For ads, UGC-style content performs best on TikTok and Facebook.',
  },
]

export default function EcommercePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Industries',
        item: 'https://blacktools.ai/industries',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'E-Commerce',
        item: 'https://blacktools.ai/industries/ecommerce',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-[#050505] text-white">
        {/* Header */}
        <header className="border-b border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              blacktools<span className="text-neutral-500">.ai</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
              <Link href="/ai-ugc-generator" className="hover:text-white transition-colors">AI UGC</Link>
              <Link href="/ai-product-video-generator" className="hover:text-white transition-colors">Product Videos</Link>
              <Link href="/industries/ecommerce" className="text-white">E-Commerce</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            </nav>
            <Link
              href="/signup"
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400 mb-6">
              <ShoppingCart className="w-4 h-4 text-emerald-500" />
              For E-Commerce Stores
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Video for E-Commerce
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Scale Your Store&apos;s Video Content
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Create product videos, ads, and UGC for your e-commerce business. AI-powered content for Shopify, Amazon, TikTok Shop, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Start Creating Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#video-types"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                See E-Commerce Examples
              </Link>
            </div>
          </div>
        </section>

        {/* Why Video */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Why E-Commerce Needs AI Video</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <h3 className="text-lg font-medium mb-4 text-emerald-400">Video Drives Sales</h3>
                <ul className="space-y-3">
                  {whyVideo.stats.map((stat, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-400">
                      <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {stat}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <h3 className="text-lg font-medium mb-4 text-red-400">The Production Challenge</h3>
                <ul className="space-y-3">
                  {whyVideo.challenges.map((challenge, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-400">
                      <span className="text-red-400">✕</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-neutral-300">
                <strong className="text-white">The AI Solution:</strong> Create unlimited product videos from URLs and images. Update content as fast as your inventory changes.
              </p>
            </div>
          </div>
        </section>

        {/* Video Types */}
        <section id="video-types" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">E-Commerce Video Types</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videoTypes.map((type) => (
                <div key={type.title} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-1">{type.title}</h3>
                  <p className="text-sm text-neutral-400">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Integration */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Platform Integration</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <div key={platform.name} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    {platform.name}
                  </h3>
                  <p className="text-sm text-neutral-400">{platform.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="border-b border-white/5 pb-6">
                  <h3 className="text-lg font-medium mb-3">{faq.question}</h3>
                  <p className="text-neutral-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-medium mb-4">Grow Your Store with AI Video</h2>
            <p className="text-neutral-400 mb-8">Product videos at scale. No filming required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Start Free
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <p>&copy; {new Date().getFullYear()} blacktools.ai. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
