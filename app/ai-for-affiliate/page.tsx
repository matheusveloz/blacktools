import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, DollarSign, Link2, Layers, Target, BarChart3, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI for Affiliate Marketing - Create Affiliate Content | blacktools.ai',
  description: 'Generate affiliate marketing videos with AI. Product reviews, comparisons, testimonials. Scale your affiliate content without filming. Try free.',
  keywords: 'AI affiliate marketing, affiliate video AI, AI product reviews, affiliate content generator',
  alternates: {
    canonical: 'https://blacktools.ai/ai-for-affiliate',
  },
  openGraph: {
    title: 'AI for Affiliate Marketing - Create Affiliate Content',
    description: 'Generate affiliate marketing videos with AI. Product reviews, comparisons, testimonials.',
    url: 'https://blacktools.ai/ai-for-affiliate',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI for Affiliate Marketing - Create Affiliate Content',
    description: 'Generate affiliate marketing videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const contentTypes = [
  { title: 'Product Reviews', description: 'AI avatars delivering honest, engaging product reviews.' },
  { title: 'Comparison Videos', description: '"Product A vs Product B" style content that converts.' },
  { title: 'Top 10 Lists', description: 'Ranking videos showcasing multiple affiliate products.' },
  { title: 'Unboxing Style', description: 'First impressions and reaction content.' },
  { title: 'Tutorial Content', description: 'How-to videos featuring affiliate products.' },
]

const features = [
  {
    icon: Link2,
    title: 'URL to Content',
    description: 'Paste affiliate product URLs—AI extracts info and generates videos.',
  },
  {
    icon: Layers,
    title: 'Multiple Angles',
    description: 'Create different perspectives on the same product for testing.',
  },
  {
    icon: Target,
    title: 'Platform Optimization',
    description: 'TikTok, YouTube, Instagram—optimized for each platform.',
  },
  {
    icon: Shield,
    title: 'Disclosure Compliance',
    description: 'Easy affiliate disclosure integration in videos.',
  },
]

const faqs = [
  {
    question: 'Can AI help with affiliate marketing?',
    answer: 'Yes. blacktools.ai helps affiliate marketers create product videos at scale. Generate reviews, comparisons, and promotional content with AI avatars—dramatically increasing your content output.',
  },
  {
    question: 'Is AI affiliate content effective?',
    answer: 'Many affiliates report strong results with AI-generated content. The key is volume and testing—AI lets you create more content to find what converts.',
  },
  {
    question: 'Do I need to disclose AI-generated content?',
    answer: 'Disclosure requirements vary by platform and region. We recommend following FTC guidelines and platform policies regarding AI-generated and affiliate content.',
  },
]

export default function AIForAffiliatePage() {
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
        name: 'AI for Affiliate',
        item: 'https://blacktools.ai/ai-for-affiliate',
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
              <Link href="/ai-for-affiliate" className="text-white">For Affiliates</Link>
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
              <DollarSign className="w-4 h-4 text-yellow-500" />
              Scale Your Affiliate Business
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI for Affiliate Marketing
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Scale Your Affiliate Content with AI
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Create product reviews, comparisons, and promotional videos without filming. AI-powered content for affiliate marketers.
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
                href="#content-types"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                See Examples
              </Link>
            </div>
          </div>
        </section>

        {/* What is it */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-6">What is AI for Affiliate Marketing?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                <strong className="text-white">AI affiliate tools</strong> help marketers create promotional content at scale. Instead of filming product reviews yourself, AI generates professional videos with realistic avatars promoting affiliate products.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai helps affiliate marketers create <strong className="text-white">review videos, comparison content, and promotional materials</strong> efficiently.
              </p>
            </div>
          </div>
        </section>

        {/* Content Types */}
        <section id="content-types" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Affiliate Content Types</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentTypes.map((type) => (
                <div key={type.title} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-1">{type.title}</h3>
                  <p className="text-sm text-neutral-400">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Features</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <feature.icon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
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
            <h2 className="text-3xl font-medium mb-4">Scale Your Affiliate Business</h2>
            <p className="text-neutral-400 mb-8">More content. More products. More commissions.</p>
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
