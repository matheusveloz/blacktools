import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Facebook, Users, Layers, Target, Repeat, Zap, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Facebook Ad Generator - Create Converting Meta Ads | blacktools.ai',
  description: 'Generate high-converting Facebook & Instagram ads with AI. UGC-style videos, AI avatars, automatic sizing. Scale your Meta ads without filming. Try free.',
  keywords: 'AI Facebook ad generator, Facebook ad creator, Meta ads AI, Instagram ad generator, Facebook video ads AI',
  alternates: {
    canonical: 'https://blacktools.ai/ai-facebook-ad-generator',
  },
  openGraph: {
    title: 'AI Facebook Ad Generator - Create Converting Meta Ads',
    description: 'Generate high-converting Facebook & Instagram ads with AI. UGC-style videos, AI avatars.',
    url: 'https://blacktools.ai/ai-facebook-ad-generator',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Facebook Ad Generator - Create Converting Meta Ads',
    description: 'Generate high-converting Facebook & Instagram ads with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const problems = [
  { issue: 'Hiring creators costs $100-500+ per video' },
  { issue: 'Production takes days or weeks' },
  { issue: 'Limited variations for A/B testing' },
  { issue: 'Hard to scale winning creatives' },
]

const solutions = [
  { benefit: 'Generate ads in minutes, not weeks' },
  { benefit: 'Create unlimited variations instantly' },
  { benefit: 'Test different hooks, avatars, and scripts' },
  { benefit: 'Scale what works without creative bottlenecks' },
]

const features = [
  {
    icon: Layers,
    title: 'Automatic Format Optimization',
    description: 'Generate ads in all Meta formats automatically: Feed (1:1, 4:5), Stories/Reels (9:16), In-Stream (16:9).',
  },
  {
    icon: Users,
    title: 'UGC-Style Content',
    description: 'Create authentic-looking user-generated content that performs better than polished brand ads. Our AI avatars deliver testimonials, demos, and reviews naturally.',
  },
  {
    icon: Repeat,
    title: 'Hook Variations',
    description: 'Generate multiple hooks for the same ad to find what resonates. Test different opening lines without recreating the entire video.',
  },
  {
    icon: Target,
    title: 'Performance-Focused Templates',
    description: "Use templates designed for Facebook's algorithm—optimized for watch time, engagement, and conversions.",
  },
]

const adTypes = [
  { title: 'Testimonial Ads', description: 'AI avatars sharing product experiences' },
  { title: 'Product Demo Ads', description: 'Showcase features and benefits' },
  { title: 'Problem-Solution Ads', description: 'Address pain points and present solutions' },
  { title: 'Comparison Ads', description: 'Compare your product to alternatives' },
  { title: 'Unboxing Ads', description: 'First impressions and reactions' },
  { title: 'How-To Ads', description: 'Educational content that sells' },
]

const steps = [
  { step: 1, title: 'Choose Ad Type', description: 'Select from testimonial, demo, problem-solution, etc.' },
  { step: 2, title: 'Enter Product Info', description: 'Describe your product or paste your URL' },
  { step: 3, title: 'Select Avatar', description: 'Choose from 300+ AI avatars matching your target audience' },
  { step: 4, title: 'Generate Script', description: 'Use AI or write your own hook and body' },
  { step: 5, title: 'Create Ad', description: 'Generate video in all Facebook formats' },
  { step: 6, title: 'Download & Launch', description: 'Export and upload directly to Meta Ads Manager' },
]

const faqs = [
  {
    question: 'What is the best AI Facebook ad generator?',
    answer: 'blacktools.ai is designed specifically for performance marketers creating Meta ads. We offer UGC-style videos with 300+ AI avatars, automatic format optimization for Facebook and Instagram, and batch generation for A/B testing at scale.',
  },
  {
    question: 'Do AI-generated Facebook ads convert?',
    answer: 'Yes. Many brands report equal or better performance from AI-generated UGC compared to traditional creator content. The key is testing multiple variations—which AI makes easy and affordable.',
  },
  {
    question: 'What Facebook ad formats can I create?',
    answer: 'blacktools.ai generates ads in all Meta formats: square (1:1) for feed, vertical (4:5) for mobile feed, full vertical (9:16) for Stories/Reels, and landscape (16:9) for in-stream placements.',
  },
  {
    question: 'How much does AI Facebook ad creation cost?',
    answer: 'With blacktools.ai, you can create Facebook ads starting at $24.50/month for the Starter plan (550 credits). Each ad typically uses 5-10 credits, so you can create 50-100+ ads per month.',
  },
  {
    question: 'Can I use AI ads on Instagram too?',
    answer: 'Yes. blacktools.ai generates ads optimized for both Facebook and Instagram. The same video can be exported in formats suitable for Feed, Stories, Reels, and Explore placements.',
  },
]

export default function AIFacebookAdGeneratorPage() {
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
        name: 'AI Facebook Ad Generator',
        item: 'https://blacktools.ai/ai-facebook-ad-generator',
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
              <Link href="/ai-facebook-ad-generator" className="text-white">Facebook Ads</Link>
              <Link href="/ai-tiktok-ad-generator" className="hover:text-white transition-colors">TikTok Ads</Link>
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
              <Facebook className="w-4 h-4 text-blue-500" />
              Meta Ads Optimized
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Facebook Ad Generator
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Create High-Converting Meta Ads with AI
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Generate scroll-stopping Facebook and Instagram video ads in minutes.
              No filming, no actors, no waiting—just AI-powered ad creation at scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Create Facebook Ad Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#examples"
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
            <h2 className="text-3xl font-medium mb-6">What is an AI Facebook Ad Generator?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                An <strong className="text-white">AI Facebook Ad Generator</strong> uses artificial intelligence to create video advertisements optimized for Meta platforms (Facebook and Instagram). Instead of hiring videographers and actors, AI generates professional UGC-style ads with realistic avatars, perfect for performance marketing.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai combines <strong className="text-white">Sora 2, Veo 3.1, and advanced lip-sync</strong> to create Facebook ads that look authentic and convert.
              </p>
            </div>
          </div>
        </section>

        {/* Problem vs Solution */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Why AI for Facebook Ads?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <h3 className="text-lg font-medium mb-4 text-red-400">The Problem with Traditional Ad Creation</h3>
                <ul className="space-y-3">
                  {problems.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-400">
                      <span className="text-red-400">✕</span>
                      {p.issue}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
                <h3 className="text-lg font-medium mb-4 text-green-400">The AI Solution</h3>
                <ul className="space-y-3">
                  {solutions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-400">
                      <span className="text-green-400">✓</span>
                      {s.benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="examples" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Features for Facebook Ads</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <feature.icon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ad Types */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Facebook Ad Types You Can Create</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {adTypes.map((type) => (
                <div key={type.title} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-1">{type.title}</h3>
                  <p className="text-sm text-neutral-400">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 text-lg font-medium">
                    {step.step}
                  </div>
                  <h3 className="font-medium mb-2">{step.title}</h3>
                  <p className="text-sm text-neutral-400">{step.description}</p>
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
            <h2 className="text-3xl font-medium mb-4">Start Creating Facebook Ads with AI</h2>
            <p className="text-neutral-400 mb-8">Generate converting Meta ads in minutes. No filming required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Create Free Ad
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
