import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Code, Webhook, Server, Zap, Globe, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Video API - Integrate AI Video Generation | blacktools.ai',
  description: 'Integrate AI video generation into your app with our API. Sora 2, Veo 3.1, lip sync, avatars. RESTful API, webhooks, SDKs. Documentation & free trial.',
  keywords: 'AI video API, video generation API, Sora API, AI avatar API, text to video API',
  alternates: {
    canonical: 'https://blacktools.ai/ai-video-api',
  },
  openGraph: {
    title: 'AI Video API - Integrate AI Video Generation',
    description: 'Integrate AI video generation into your app with our API. Sora 2, Veo 3.1, lip sync, avatars.',
    url: 'https://blacktools.ai/ai-video-api',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video API - Integrate AI Video Generation',
    description: 'Integrate AI video generation into your app with our API.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const apiCapabilities = [
  {
    title: 'Video Generation',
    code: `POST /api/v1/video/generate
{
  "type": "avatar",
  "avatar_id": "avatar_123",
  "script": "Your script here",
  "language": "en",
  "format": "9:16"
}`,
  },
  {
    title: 'Text to Speech',
    code: `POST /api/v1/audio/tts
{
  "text": "Your text here",
  "voice_id": "voice_456",
  "language": "en"
}`,
  },
  {
    title: 'Lip Sync',
    code: `POST /api/v1/video/lipsync
{
  "video_url": "https://...",
  "audio_url": "https://..."
}`,
  },
]

const features = [
  {
    icon: Server,
    title: 'Multiple AI Models',
    description: 'Access Sora 2, Veo 3.1, and proprietary models through unified endpoints.',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Get notified when videos complete. No polling required.',
  },
  {
    icon: Code,
    title: 'SDKs',
    description: 'Official SDKs for Python, JavaScript, and more.',
  },
  {
    icon: Shield,
    title: 'High Availability',
    description: '99.9% uptime SLA with global CDN delivery.',
  },
  {
    icon: Zap,
    title: 'Scalable Pricing',
    description: 'Pay per generation. Volume discounts available.',
  },
]

const useCases = [
  { title: 'SaaS Platforms', description: 'Add video creation to your product' },
  { title: 'Marketing Tools', description: 'Automate video ad generation' },
  { title: 'E-Commerce', description: 'Generate product videos programmatically' },
  { title: 'Content Platforms', description: 'Enable user video creation' },
  { title: 'Agencies', description: 'Build custom video workflows' },
]

const faqs = [
  {
    question: 'What can I build with the AI Video API?',
    answer: 'You can build any application requiring AI video generation: marketing automation tools, e-commerce platforms, content management systems, social media tools, and more. Our API handles avatar videos, text-to-video, lip sync, and voiceover generation.',
  },
  {
    question: 'How does API pricing work?',
    answer: 'API usage is credit-based, similar to our web platform. Premium plans include API access with 2,500 credits/month. For higher volume, contact us for custom API pricing with volume discounts.',
  },
  {
    question: "What's the typical video generation time?",
    answer: "Most videos generate in 1-5 minutes depending on length and complexity. Our API supports webhooks so you don't need to poll for completion.",
  },
  {
    question: 'Is there rate limiting?',
    answer: 'Standard API access allows 10 concurrent requests. Enterprise plans offer higher limits and dedicated resources.',
  },
]

export default function AIVideoApiPage() {
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
        name: 'AI Video API',
        item: 'https://blacktools.ai/ai-video-api',
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
              <Link href="/ai-video-generator" className="hover:text-white transition-colors">Video Generator</Link>
              <Link href="/ai-video-api" className="text-white">Video API</Link>
              <Link href="/lipsync-api" className="hover:text-white transition-colors">Lip Sync API</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            </nav>
            <Link
              href="/signup"
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              Get API Key
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400 mb-6">
              <Code className="w-4 h-4 text-emerald-500" />
              RESTful API • Webhooks • SDKs
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Video API
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Integrate AI Video Generation Into Your Product
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Add powerful video creation capabilities to your app. RESTful API with access to Sora 2, Veo 3.1, lip sync, and 300+ AI avatars.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                View API Documentation
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#capabilities"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                Get API Key
              </Link>
            </div>
          </div>
        </section>

        {/* What is it */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-6">What is the AI Video API?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                The <strong className="text-white">blacktools.ai Video API</strong> lets developers integrate AI video generation into their own products. Build video creation features without developing AI models—our API handles the complexity.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                Access <strong className="text-white">Sora 2, Veo 3.1, lip sync, and 300+ avatars</strong> through simple REST endpoints.
              </p>
            </div>
          </div>
        </section>

        {/* API Capabilities */}
        <section id="capabilities" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">API Capabilities</h2>
            <div className="space-y-6">
              {apiCapabilities.map((cap) => (
                <div key={cap.title} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-4 text-emerald-400">{cap.title}</h3>
                  <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm text-neutral-300">
                    <code>{cap.code}</code>
                  </pre>
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
                  <feature.icon className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Use Cases</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {useCases.map((useCase) => (
                <div key={useCase.title} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-1">{useCase.title}</h3>
                  <p className="text-sm text-neutral-400">{useCase.description}</p>
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

        {/* Coming Soon Notice */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Coming Soon
            </div>
            <h2 className="text-3xl font-medium mb-4">API Access Coming Soon</h2>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              We are working hard to bring you a powerful, developer-friendly API. Sign up now to be notified when the AI Video API becomes available and get early access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Join the Waitlist
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
