import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Play, Smartphone, Sparkles, Clock, Users, Zap, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI TikTok Ad Generator - Create Viral TikTok Ads | blacktools.ai',
  description: 'Generate viral TikTok ads with AI. Native-looking UGC videos, trending formats, AI avatars. Create scroll-stopping TikTok content without filming. Try free.',
  keywords: 'AI TikTok ad generator, TikTok ad creator, TikTok video ads AI, TikTok UGC, TikTok marketing AI',
  alternates: {
    canonical: 'https://blacktools.ai/ai-tiktok-ad-generator',
  },
  openGraph: {
    title: 'AI TikTok Ad Generator - Create Viral TikTok Ads',
    description: 'Generate viral TikTok ads with AI. Native-looking UGC videos, trending formats.',
    url: 'https://blacktools.ai/ai-tiktok-ad-generator',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI TikTok Ad Generator - Create Viral TikTok Ads',
    description: 'Generate viral TikTok ads with AI. Native-looking UGC videos.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const whyDifferent = [
  {
    icon: Clock,
    title: 'TikTok Users Scroll Fast',
    description: 'You have less than 1 second to grab attention. Traditional ads get skipped immediately.',
  },
  {
    icon: Sparkles,
    title: 'Authenticity Wins',
    description: 'TikTok users engage with content that feels real, not produced. UGC-style performs 2-3x better than brand content.',
  },
  {
    icon: TrendingUp,
    title: 'Trends Move Quickly',
    description: 'By the time you film and edit, the trend is over. AI lets you create trend-responsive content in minutes.',
  },
]

const features = [
  {
    icon: Smartphone,
    title: 'Native-Looking Content',
    description: 'AI generates videos that look like they were filmed on a phone by a real person—not overproduced brand content.',
  },
  {
    icon: Play,
    title: 'Vertical-First (9:16)',
    description: "All content is created in TikTok's native vertical format, optimized for full-screen mobile viewing.",
  },
  {
    icon: Zap,
    title: 'Hook Generator',
    description: 'Create multiple opening hooks to test what stops the scroll. First 1-2 seconds are everything on TikTok.',
  },
  {
    icon: TrendingUp,
    title: 'Trend-Ready Templates',
    description: 'Templates based on proven TikTok ad formats: talking head, split-screen, reaction, storytime, and more.',
  },
  {
    icon: Users,
    title: 'Gen Z Avatars',
    description: "Access AI avatars that match TikTok's core demographic—young, relatable, and authentic.",
  },
]

const adTypes = [
  { title: 'Talking Head', description: 'Direct-to-camera testimonials and reviews' },
  { title: 'Storytime', description: 'Narrative-style "let me tell you about..."' },
  { title: 'Reaction', description: 'Avatar reacting to product or results' },
  { title: 'Problem-Agitate-Solution', description: 'Classic ad structure, TikTok style' },
  { title: 'Tutorial/How-To', description: 'Educational content that sells' },
  { title: 'Green Screen', description: 'Avatar over product images or screenshots' },
]

const steps = [
  { step: 1, title: 'Select TikTok Template', description: 'Choose from proven ad formats' },
  { step: 2, title: 'Describe Your Product', description: 'Enter details or paste your URL' },
  { step: 3, title: 'Pick Your Avatar', description: 'Select a Gen Z or millennial AI creator' },
  { step: 4, title: 'Generate Hooks', description: 'Create 3-5 hook variations to test' },
  { step: 5, title: 'Create Videos', description: 'Generate multiple variations in minutes' },
  { step: 6, title: 'Export for TikTok', description: 'Download in 9:16 format ready to upload' },
]

const faqs = [
  {
    question: 'What is the best AI TikTok ad generator?',
    answer: "blacktools.ai is optimized for TikTok advertising with native-looking UGC content, Gen Z avatars, and formats designed for the platform. We focus on creating ads that don't look like ads—which is what works on TikTok.",
  },
  {
    question: 'Do AI TikTok ads actually work?',
    answer: "Yes. The key to TikTok ads is authenticity, not production value. AI-generated UGC from blacktools.ai looks native to the platform, which drives higher engagement and conversions than traditional video ads.",
  },
  {
    question: 'What makes a TikTok ad successful?',
    answer: 'Successful TikTok ads have: 1) A strong hook in the first 1-2 seconds, 2) Authentic, non-polished feel, 3) Native format (9:16 vertical), 4) Clear call-to-action. blacktools.ai optimizes for all of these.',
  },
  {
    question: 'Can I create TikTok Spark Ads with AI?',
    answer: 'While Spark Ads traditionally use organic creator content, you can use AI-generated videos for regular TikTok ads or work with the AI content as a starting point for your campaigns.',
  },
  {
    question: 'How many TikTok ads should I test?',
    answer: 'TikTok recommends testing at least 3-5 ad variations. With blacktools.ai, you can easily create 10-20+ variations to find winning hooks and scripts—something that would be expensive with traditional production.',
  },
]

export default function AITikTokAdGeneratorPage() {
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
        name: 'AI TikTok Ad Generator',
        item: 'https://blacktools.ai/ai-tiktok-ad-generator',
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
              <Link href="/ai-facebook-ad-generator" className="hover:text-white transition-colors">Facebook Ads</Link>
              <Link href="/ai-tiktok-ad-generator" className="text-white">TikTok Ads</Link>
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
              <Play className="w-4 h-4 text-pink-500" />
              TikTok Native Format
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI TikTok Ad Generator
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Create Native TikTok Ads That Don&apos;t Look Like Ads
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Generate scroll-stopping TikTok content with AI. UGC-style videos that blend into the feed and convert.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Create TikTok Ad Free
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
            <h2 className="text-3xl font-medium mb-6">What is an AI TikTok Ad Generator?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                An <strong className="text-white">AI TikTok Ad Generator</strong> creates video advertisements specifically designed for TikTok&apos;s unique format and audience. These aren&apos;t traditional polished commercials—they&apos;re authentic-looking, creator-style videos that feel native to the platform.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai generates TikTok ads with <strong className="text-white">AI avatars that look like real creators</strong>, complete with natural expressions and perfect lip-sync.
              </p>
            </div>
          </div>
        </section>

        {/* Why Different */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Why TikTok Needs a Different Approach</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {whyDifferent.map((item) => (
                <div key={item.title} className="text-center">
                  <item.icon className="w-10 h-10 text-pink-400 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="examples" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Features for TikTok Ads</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <feature.icon className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
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
            <h2 className="text-3xl font-medium mb-8 text-center">TikTok Ad Types You Can Create</h2>
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
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-4 text-lg font-medium">
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
            <h2 className="text-3xl font-medium mb-4">Start Creating TikTok Ads with AI</h2>
            <p className="text-neutral-400 mb-8">Native-looking ads that convert. No filming required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Create Free TikTok Ad
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
