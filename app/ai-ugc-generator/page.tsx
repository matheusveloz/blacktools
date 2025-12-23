import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Zap, Globe, Users, Layers, Play, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI UGC Generator - Create Viral UGC Ads in Minutes | blacktools.ai',
  description: 'Create professional AI UGC videos for TikTok, Instagram & Facebook ads. 300+ AI avatars, realistic lip-sync, batch processing. No filming required. Start free trial.',
  keywords: 'AI UGC generator, AI UGC video, AI video ads, UGC creator AI, AI avatars for ads, TikTok AI ads, AI marketing videos',
  alternates: {
    canonical: 'https://blacktools.ai/ai-ugc-generator',
  },
  openGraph: {
    title: 'AI UGC Generator - Create Viral UGC Ads in Minutes',
    description: 'Create professional AI UGC videos for TikTok, Instagram & Facebook ads. 300+ AI avatars, realistic lip-sync.',
    url: 'https://blacktools.ai/ai-ugc-generator',
    siteName: 'blacktools.ai',
    type: 'website',
    images: [
      {
        url: 'https://blacktools.ai/og-ugc-generator.png',
        width: 1200,
        height: 630,
        alt: 'AI UGC Generator - blacktools.ai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI UGC Generator - Create Viral UGC Ads in Minutes',
    description: 'Create professional AI UGC videos with 300+ AI avatars and realistic lip-sync.',
    images: ['https://blacktools.ai/og-ugc-generator.png'],
  },
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
}

const features = [
  {
    icon: Users,
    title: '300+ Hyper-Realistic AI Avatars',
    description: 'Choose from our extensive library of AI avatars across all demographics, ages, and styles. Each avatar features natural expressions, realistic movements, and authentic delivery.',
  },
  {
    icon: Play,
    title: 'Advanced LipSync Technology',
    description: 'Our proprietary lip-sync engine ensures perfect audio-visual synchronization in any language. Your avatars deliver scripts with natural mouth movements and facial expressions.',
  },
  {
    icon: Layers,
    title: 'Batch Processing & Bulk Creation',
    description: 'Run multiple video generations simultaneously. Create dozens of ad variations in parallel—test different hooks, avatars, and scripts without waiting.',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Reach global audiences with content in 30+ languages. Our AI handles accurate translation and native-sounding voiceovers with perfect lip-sync.',
  },
]

const useCases = [
  {
    title: 'E-Commerce',
    description: 'Product demos, unboxings, testimonials for Shopify & Amazon stores',
  },
  {
    title: 'SaaS & Apps',
    description: 'Feature explanations, onboarding videos, app walkthroughs',
  },
  {
    title: 'Agencies',
    description: 'Scale client content, white-label solutions, rapid creative testing',
  },
]

const steps = [
  {
    number: '1',
    title: 'Write Your Script',
    description: 'Enter your ad copy or use our AI script generator to create high-converting hooks',
  },
  {
    number: '2',
    title: 'Choose Your Avatar',
    description: 'Select from 300+ AI avatars that match your target demographic',
  },
  {
    number: '3',
    title: 'Generate Video',
    description: 'Our AI creates your UGC video with realistic lip-sync in minutes',
  },
  {
    number: '4',
    title: 'Download & Launch',
    description: 'Export in any format and publish directly to TikTok, Meta, or YouTube',
  },
]

const faqs = [
  {
    question: 'What is an AI UGC generator?',
    answer: 'An AI UGC generator is a tool that uses artificial intelligence to create user-generated content style videos. Instead of filming real people, AI generates realistic digital avatars that can deliver scripts, showcase products, and create authentic-looking testimonial videos. blacktools.ai combines multiple AI technologies including Sora 2, Veo 3.1, and advanced lip-sync to produce high-quality UGC videos.',
  },
  {
    question: 'How does AI UGC compare to traditional UGC?',
    answer: 'Traditional UGC requires hiring creators ($100-500 per video), coordinating schedules, and waiting days or weeks for content. AI UGC generates videos in minutes at a fraction of the cost. You can create unlimited variations, test different approaches instantly, and scale content production without creative bottlenecks.',
  },
  {
    question: 'Is AI UGC effective for advertising?',
    answer: 'Yes. AI-generated UGC maintains the authentic, relatable feel that makes UGC effective while offering unprecedented scale and speed. Many brands report similar or better performance compared to traditional UGC, especially when A/B testing multiple variations to find winning creative.',
  },
  {
    question: 'What platforms can I use AI UGC on?',
    answer: 'AI UGC videos from blacktools.ai work on all major platforms including TikTok, Instagram Reels, Facebook/Meta Ads, YouTube Shorts, and Snapchat. Videos are exported in optimized formats for each platform.',
  },
  {
    question: 'Do I need to disclose that content is AI-generated?',
    answer: 'Disclosure requirements vary by platform and jurisdiction. We recommend checking current guidelines for TikTok, Meta, and other platforms regarding AI-generated content in advertising. Many brands include subtle disclosures while maintaining authenticity.',
  },
  {
    question: 'How long does it take to create an AI UGC video?',
    answer: "Most AI UGC videos are generated in 2-10 minutes depending on length and complexity. With blacktools.ai's batch processing, you can create multiple video variations simultaneously.",
  },
]

export default function AIUGCGeneratorPage() {
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
        name: 'AI UGC Generator',
        item: 'https://blacktools.ai/ai-ugc-generator',
      },
    ],
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create AI UGC Videos with blacktools.ai',
    description: 'Step-by-step guide to creating AI-generated user content videos',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '24.50',
    },
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      name: step.title,
      text: step.description,
      position: index + 1,
    })),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="min-h-screen bg-[#050505] text-white">
        {/* Header */}
        <header className="border-b border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              blacktools.ai
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
              <Link href="/ai-ugc-generator" className="text-white">AI UGC</Link>
              <Link href="/ai-avatar-creator" className="hover:text-white transition-colors">AI Avatars</Link>
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
              <Zap className="w-4 h-4 text-yellow-500" />
              Powered by Sora 2, Veo 3.1 & Advanced LipSync
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI UGC Video Generator
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Create Scroll-Stopping UGC Ads with AI
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Generate authentic-looking user-generated content videos in minutes.
              No filming, no actors, no waiting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#examples"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                See Examples
              </a>
            </div>
          </div>
        </section>

        {/* What is AI UGC */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-6">What is AI UGC?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                <strong className="text-white">AI UGC (Artificial Intelligence User-Generated Content)</strong> refers to video content created by AI that mimics authentic user-made videos. Instead of hiring influencers or filming yourself, AI generates realistic videos with digital avatars that look and sound like real people.
              </p>
              <p className="text-neutral-400 leading-relaxed mb-8">
                blacktools.ai uses advanced AI models including <strong className="text-white">Sora 2, Veo 3.1, and proprietary LipSync technology</strong> to create UGC-style videos that convert. Our AI avatars can showcase your products, deliver testimonials, and create engaging ad content at scale.
              </p>

              <h3 className="text-xl font-medium text-white mb-4">Why Brands Choose AI UGC</h3>
              <ul className="space-y-3 text-neutral-400">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">10x Faster:</strong> Create videos in minutes instead of weeks</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">90% Cost Reduction:</strong> No influencer fees, no production costs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Unlimited Variations:</strong> A/B test hooks, scripts, and avatars instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Global Reach:</strong> 30+ languages with native lip-sync</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Always Available:</strong> No scheduling, no delays, 24/7 content creation</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                  <feature.icon className="w-8 h-8 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                  <p className="text-neutral-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">How It Works</h2>
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-medium flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">{step.title}</h3>
                    <p className="text-neutral-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section id="examples" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Use Cases</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((useCase) => (
                <div key={useCase.title} className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <h3 className="text-lg font-medium mb-2">{useCase.title}</h3>
                  <p className="text-neutral-400 text-sm">{useCase.description}</p>
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
            <h2 className="text-3xl font-medium mb-4">Ready to Scale Your UGC Production?</h2>
            <p className="text-neutral-400 mb-8">Start creating AI UGC videos today. No credit card required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Start Free Trial
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
