import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Megaphone, Users, Layers, BarChart3, Repeat, Zap, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Ads - Generate Video Ads with AI | blacktools.ai',
  description: 'Create high-converting video ads with AI. UGC-style content, AI actors, automatic formats for TikTok, Facebook, Instagram, YouTube. Scale ad production. Try free.',
  keywords: 'AI ads, AI video ads, AI ad generator, AI advertising, AI ad creation, video ad AI',
  alternates: {
    canonical: 'https://blacktools.ai/ai-ads',
  },
  openGraph: {
    title: 'AI Ads - Generate Video Ads with AI',
    description: 'Create high-converting video ads with AI. UGC-style content, AI actors, automatic formats.',
    url: 'https://blacktools.ai/ai-ads',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Ads - Generate Video Ads with AI',
    description: 'Create high-converting video ads with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const comparison = {
  traditional: {
    title: 'Traditional Ad Production',
    items: ['$500-5,000+ per video', 'Days to weeks of production time', 'Limited variations for testing', 'Expensive to iterate'],
  },
  ai: {
    title: 'AI Ad Production',
    items: ['$1-5 per video', 'Minutes to generate', 'Unlimited variations', 'Easy iteration and testing'],
  },
}

const platforms = [
  { name: 'TikTok Ads', description: 'Native-looking vertical videos (9:16) that blend with organic content.' },
  { name: 'Facebook Ads', description: 'Multiple formats (1:1, 4:5, 9:16) optimized for Feed, Stories, and Reels.' },
  { name: 'Instagram Ads', description: 'Story, Reel, and Feed formats with engaging hooks.' },
  { name: 'YouTube Ads', description: 'Pre-roll (6s bumper), skippable (15-60s), and shorts formats.' },
  { name: 'Snapchat Ads', description: 'Full-screen vertical with snap-native aesthetics.' },
]

const adTypes = [
  { title: 'UGC Testimonials', description: 'Authentic customer experience stories' },
  { title: 'Product Demos', description: 'Show features and benefits in action' },
  { title: 'Problem-Solution', description: 'Address pain points and present solutions' },
  { title: 'Comparison', description: 'Your product vs competitors' },
  { title: 'Before-After', description: 'Transformation and results' },
  { title: 'Educational', description: 'Tips and how-to content that sells' },
]

const features = [
  {
    icon: Zap,
    title: 'AI Script Generation',
    description: 'Input your product and get high-converting ad scripts automatically.',
  },
  {
    icon: Repeat,
    title: 'Hook Variations',
    description: 'Generate multiple opening hooks to test what stops the scroll.',
  },
  {
    icon: Users,
    title: '300+ AI Actors',
    description: 'Diverse talent pool for any target demographic.',
  },
  {
    icon: Layers,
    title: 'Batch Generation',
    description: 'Create 10, 50, or 100+ ad variations in one session.',
  },
  {
    icon: BarChart3,
    title: 'A/B Testing Ready',
    description: 'Export variations tagged and organized for systematic testing.',
  },
]

const faqs = [
  {
    question: 'What is the best AI ad generator?',
    answer: 'blacktools.ai is built specifically for performance marketing. We offer UGC-style ads with 300+ AI actors, platform-specific formats, hook variation testing, and batch generation. Our focus is creating ads that convert, not just look good.',
  },
  {
    question: 'How much do AI ads cost to create?',
    answer: 'With blacktools.ai, ads cost approximately $1-5 each depending on length and complexity. The Starter plan ($24.50/month) includes 550 credits—enough to create 50-100+ ads per month.',
  },
  {
    question: 'Do AI ads perform as well as traditional ads?',
    answer: 'Many brands report equal or better performance from AI-generated UGC. The advantage is scale: you can test 20 AI ad variations for the cost of 1 traditional ad, finding winners faster.',
  },
  {
    question: 'Can AI create ads for any platform?',
    answer: 'Yes. blacktools.ai generates ads optimized for TikTok, Facebook, Instagram, YouTube, Snapchat, and more. We automatically format content for each platform\'s specifications.',
  },
  {
    question: 'How many ad variations should I test?',
    answer: 'We recommend testing at least 5-10 variations per campaign. With AI, testing 20-50 variations is affordable—dramatically increasing your chances of finding winning creative.',
  },
]

export default function AIAdsPage() {
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
        name: 'AI Ads',
        item: 'https://blacktools.ai/ai-ads',
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
              <Link href="/ai-ads" className="text-white">AI Ads</Link>
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
              <Megaphone className="w-4 h-4 text-green-500" />
              All Platforms Supported
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Ads
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Create Video Ads at Scale with AI
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Generate high-converting video ads for every platform. TikTok, Facebook, Instagram, YouTube—one tool for all your ad creative needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Create AI Ads Free
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

        {/* What are AI Ads */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-6">What Are AI Ads?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                <strong className="text-white">AI Ads</strong> are video advertisements created using artificial intelligence. Instead of traditional video production with cameras, actors, and editors, AI generates professional ad content from text prompts, product info, and templates.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai creates UGC-style AI ads with <strong className="text-white">realistic avatars, perfect lip-sync, and platform-optimized formats</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Why AI for Ad Creation?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <h3 className="text-lg font-medium mb-4 text-red-400">{comparison.traditional.title}</h3>
                <ul className="space-y-3">
                  {comparison.traditional.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-400">
                      <span className="text-red-400">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
                <h3 className="text-lg font-medium mb-4 text-green-400">{comparison.ai.title}</h3>
                <ul className="space-y-3">
                  {comparison.ai.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-400">
                      <span className="text-green-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section id="platforms" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Platform-Optimized Ads</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <div key={platform.name} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-2">{platform.name}</h3>
                  <p className="text-sm text-neutral-400">{platform.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ad Types */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Ad Types You Can Create</h2>
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

        {/* Features */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Features</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <feature.icon className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
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
            <h2 className="text-3xl font-medium mb-4">Start Creating AI Ads</h2>
            <p className="text-neutral-400 mb-8">Scale your ad production. Test more. Win more.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Create Free Ads
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
