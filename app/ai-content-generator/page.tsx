import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileVideo, Layers, Users, Settings, BarChart3, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Content Generator - Create Marketing Content at Scale | blacktools.ai',
  description: 'Generate video content for all your marketing needs with AI. Ads, social posts, product videos, testimonials. One platform for all content. Try free.',
  keywords: 'AI content generator, AI marketing content, AI video content, content creation AI, AI content at scale',
  alternates: {
    canonical: 'https://blacktools.ai/ai-content-generator',
  },
  openGraph: {
    title: 'AI Content Generator - Create Marketing Content at Scale',
    description: 'Generate video content for all your marketing needs with AI.',
    url: 'https://blacktools.ai/ai-content-generator',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Content Generator - Create Marketing Content at Scale',
    description: 'Generate video content for all your marketing needs with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const contentTypes = [
  {
    category: 'Video Ads',
    items: ['Facebook/Instagram ads', 'TikTok ads', 'YouTube pre-roll', 'Snapchat ads'],
  },
  {
    category: 'Social Content',
    items: ['YouTube Shorts', 'Instagram Reels', 'TikTok videos', 'LinkedIn videos'],
  },
  {
    category: 'Product Content',
    items: ['Product demos', 'Feature explainers', 'Comparison videos', 'Testimonials'],
  },
  {
    category: 'Brand Content',
    items: ['About us videos', 'Team introductions', 'Company updates', 'Event promotions'],
  },
]

const features = [
  {
    icon: Layers,
    title: 'Multi-Format Export',
    description: 'One video, all formats. Generate once, export for every platform.',
  },
  {
    icon: Settings,
    title: 'Brand Consistency',
    description: 'Save brand elements—colors, fonts, tone—for consistent output.',
  },
  {
    icon: Calendar,
    title: 'Content Calendar Integration',
    description: 'Plan and generate content in batches aligned with your calendar.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Multiple users, shared assets, approval workflows.',
  },
  {
    icon: BarChart3,
    title: 'Performance Insights',
    description: 'Track which AI content performs best and generate more like it.',
  },
]

const faqs = [
  {
    question: "What's the best AI content generator for marketing?",
    answer: 'blacktools.ai is purpose-built for marketing teams. We offer video ads, UGC, social content, and product videos in one platform—with AI avatars, lip sync, and platform optimization built in.',
  },
  {
    question: 'Can AI replace my content team?',
    answer: 'AI augments your team rather than replacing it. blacktools.ai handles production while your team focuses on strategy, creativity, and optimization. Most users produce 10x more content with the same resources.',
  },
  {
    question: 'How do I maintain brand consistency with AI?',
    answer: 'blacktools.ai lets you save brand guidelines—tone of voice, colors, preferred avatars, templates. All generated content stays on-brand automatically.',
  },
]

export default function AIContentGeneratorPage() {
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
        name: 'AI Content Generator',
        item: 'https://blacktools.ai/ai-content-generator',
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
              <Link href="/ai-video-generator" className="hover:text-white transition-colors">Video Generator</Link>
              <Link href="/ai-content-generator" className="text-white">Content Generator</Link>
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
              <FileVideo className="w-4 h-4 text-amber-500" />
              All Content Types in One Platform
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Content Generator
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              All Your Marketing Content. One AI Platform.
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Generate video ads, social content, product videos, and more. blacktools.ai is the complete AI content solution for modern marketing teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Start Creating Content
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
            <h2 className="text-3xl font-medium mb-6">What is an AI Content Generator?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                An <strong className="text-white">AI Content Generator</strong> creates marketing content using artificial intelligence. Instead of separate tools for ads, social posts, and videos, one AI platform handles all your content needs—from ideation to finished assets.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai offers <strong className="text-white">complete content generation</strong> across video ads, UGC, product content, and social media.
              </p>
            </div>
          </div>
        </section>

        {/* Content Types */}
        <section id="content-types" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Content Types</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {contentTypes.map((type) => (
                <div key={type.category} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-4 text-amber-400">{type.category}</h3>
                  <ul className="space-y-2">
                    {type.items.map((item, i) => (
                      <li key={i} className="text-sm text-neutral-400 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
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
                  <feature.icon className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
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
            <h2 className="text-3xl font-medium mb-4">Scale Your Content Production</h2>
            <p className="text-neutral-400 mb-8">One platform. All content types. AI-powered.</p>
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
