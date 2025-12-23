import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Play, Smartphone, Sparkles, Repeat, MessageSquare, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Shorts Generator - Create YouTube Shorts & Reels | blacktools.ai',
  description: 'Generate viral short-form videos with AI. Perfect for YouTube Shorts, Instagram Reels, TikTok. AI avatars, trending formats, auto-captions. Try free.',
  keywords: 'AI shorts generator, YouTube Shorts AI, Reels generator AI, short video AI, vertical video generator',
  alternates: {
    canonical: 'https://blacktools.ai/ai-shorts-generator',
  },
  openGraph: {
    title: 'AI Shorts Generator - Create YouTube Shorts & Reels',
    description: 'Generate viral short-form videos with AI. Perfect for YouTube Shorts, Instagram Reels, TikTok.',
    url: 'https://blacktools.ai/ai-shorts-generator',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Shorts Generator - Create YouTube Shorts & Reels',
    description: 'Generate viral short-form videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const platforms = [
  {
    name: 'YouTube Shorts',
    features: ['Vertical 9:16 format', 'Under 60 seconds', "Optimized for YouTube's algorithm"],
  },
  {
    name: 'Instagram Reels',
    features: ['Feed and Explore ready', 'Trending audio compatible', 'Story-style aesthetics'],
  },
  {
    name: 'TikTok',
    features: ['Native-looking content', 'Trend-responsive templates', 'Gen Z-friendly avatars'],
  },
]

const videoTypes = [
  { title: 'Talking Head', description: 'Avatar delivering insights, tips, or stories' },
  { title: 'List Videos', description: '"3 things you need to know about..."' },
  { title: 'Quick Tips', description: 'Bite-sized educational content' },
  { title: 'Reactions', description: 'Avatar responding to trends or topics' },
  { title: 'Product Showcases', description: 'Fast-paced product highlights' },
  { title: 'Storytime', description: 'Engaging narrative hooks' },
]

const features = [
  {
    icon: Smartphone,
    title: 'Vertical-First Design',
    description: 'All content created in 9:16 format, perfect for mobile viewing.',
  },
  {
    icon: TrendingUp,
    title: 'Hook Optimization',
    description: 'AI generates multiple opening hooks to maximize retention.',
  },
  {
    icon: MessageSquare,
    title: 'Auto-Captions',
    description: 'Animated captions added automatically—essential for sound-off viewing.',
  },
  {
    icon: Sparkles,
    title: 'Trending Templates',
    description: 'Templates based on viral short-form formats that perform.',
  },
  {
    icon: Repeat,
    title: 'Bulk Generation',
    description: "Create a week's worth of shorts in one session.",
  },
]

const faqs = [
  {
    question: 'What is an AI shorts generator?',
    answer: 'An AI shorts generator creates short-form vertical videos using artificial intelligence. blacktools.ai generates YouTube Shorts, Instagram Reels, and TikTok content with AI avatars, auto-captions, and platform-optimized formats.',
  },
  {
    question: 'Can AI create viral short-form content?',
    answer: 'AI helps you produce volume and test variations—key factors in finding viral content. blacktools.ai makes it easy to create 10-20 shorts per day, increasing your chances of hitting the algorithm.',
  },
  {
    question: "What's the best format for shorts?",
    answer: 'Vertical 9:16 under 60 seconds performs best across platforms. Hooks in the first 1-2 seconds, captions for sound-off viewers, and clear calls-to-action drive engagement.',
  },
  {
    question: 'How often should I post shorts?',
    answer: "Top creators post 1-3 shorts daily. AI generation makes this sustainable—create a week's content in an hour.",
  },
]

export default function AIShortsGeneratorPage() {
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
        name: 'AI Shorts Generator',
        item: 'https://blacktools.ai/ai-shorts-generator',
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
              <Link href="/ai-shorts-generator" className="text-white">Shorts Generator</Link>
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
              <Play className="w-4 h-4 text-red-500" />
              YouTube Shorts • Reels • TikTok
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Shorts Generator
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Create Viral Short-Form Videos with AI
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Generate scroll-stopping content for YouTube Shorts, Instagram Reels, and TikTok. AI-powered creation for the short-form era.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Create Shorts Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#platforms"
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
            <h2 className="text-3xl font-medium mb-6">What is an AI Shorts Generator?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                An <strong className="text-white">AI Shorts Generator</strong> creates vertical, short-form video content optimized for platforms like YouTube Shorts, Instagram Reels, and TikTok. These platforms favor consistent posting—AI makes it possible to produce daily content without a production team.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai generates <strong className="text-white">native-looking shorts</strong> with AI avatars, trending formats, and auto-captions.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Optimization */}
        <section id="platforms" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Platform Optimization</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {platforms.map((platform) => (
                <div key={platform.name} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-4 text-red-400">{platform.name}</h3>
                  <ul className="space-y-2">
                    {platform.features.map((feature, i) => (
                      <li key={i} className="text-sm text-neutral-400 flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Types */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Short-Form Video Types</h2>
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

        {/* Features */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Features</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <feature.icon className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
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
            <h2 className="text-3xl font-medium mb-4">Start Creating Shorts</h2>
            <p className="text-neutral-400 mb-8">Vertical videos. Viral potential. AI-powered.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Create Free Shorts
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
