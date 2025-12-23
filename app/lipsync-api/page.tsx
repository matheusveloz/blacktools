import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Code, Mic2, Globe, Zap, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Lip Sync API - AI Audio-Visual Synchronization | blacktools.ai',
  description: 'Integrate AI lip sync into your app. Perfect mouth synchronization in 30+ languages. REST API for video dubbing and avatar animation. Documentation & trial.',
  keywords: 'lip sync API, AI dubbing API, audio video sync API, talking head API, video translation API',
  alternates: {
    canonical: 'https://blacktools.ai/lipsync-api',
  },
  openGraph: {
    title: 'Lip Sync API - AI Audio-Visual Synchronization',
    description: 'Integrate AI lip sync into your app. Perfect mouth synchronization in 30+ languages.',
    url: 'https://blacktools.ai/lipsync-api',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lip Sync API - AI Audio-Visual Synchronization',
    description: 'Integrate AI lip sync into your app.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const apiEndpoints = [
  {
    title: 'Sync Audio to Video',
    code: `POST /api/v1/lipsync/sync
{
  "video_url": "https://your-video.mp4",
  "audio_url": "https://your-audio.mp3",
  "language": "en"
}`,
  },
  {
    title: 'Generate with Text',
    code: `POST /api/v1/lipsync/generate
{
  "video_url": "https://your-video.mp4",
  "text": "Your script here",
  "voice_id": "voice_123",
  "language": "es"
}`,
  },
]

const features = [
  '30+ Languages: Native-quality sync for global content',
  'High Accuracy: Phoneme-level synchronization',
  'Fast Processing: Results in 1-3 minutes',
  'Multiple Formats: MP4, WebM, MOV support',
  'Webhooks: Async processing with callbacks',
]

const useCases = [
  'Video Translation Platforms',
  'E-Learning Systems',
  'Avatar Applications',
  'Content Localization Tools',
  'Marketing Automation',
]

const faqs = [
  {
    question: 'How accurate is the lip sync API?',
    answer: 'Our lip sync achieves near-perfect accuracy with proprietary AI trained on millions of video samples. The API handles different languages, accents, and speaking styles.',
  },
  {
    question: 'What languages are supported?',
    answer: '30+ languages including English, Spanish, Portuguese, French, German, Italian, Japanese, Korean, Chinese, Arabic, Hindi, Russian, and more.',
  },
  {
    question: 'Can I sync any audio to any video?',
    answer: 'Yes, as long as the video contains a visible face. The API analyzes the face and generates matching lip movements for the provided audio.',
  },
]

export default function LipsyncApiPage() {
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
        name: 'Lip Sync API',
        item: 'https://blacktools.ai/lipsync-api',
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
              <Link href="/ai-lipsync" className="hover:text-white transition-colors">AI Lip Sync</Link>
              <Link href="/ai-video-api" className="hover:text-white transition-colors">Video API</Link>
              <Link href="/lipsync-api" className="text-white">Lip Sync API</Link>
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
              <Mic2 className="w-4 h-4 text-violet-500" />
              30+ Languages Supported
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              Lip Sync API
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Add AI Lip Sync to Your Application
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Perfect audio-visual synchronization through a simple API. Sync any audio to any video in 30+ languages.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                View API Docs
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#endpoints"
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
            <h2 className="text-3xl font-medium mb-6">What is the Lip Sync API?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed">
                The <strong className="text-white">blacktools.ai Lip Sync API</strong> lets developers add AI-powered lip synchronization to their applications. Sync new audio to existing video, create multilingual content, or power talking avatar experiences.
              </p>
            </div>
          </div>
        </section>

        {/* API Endpoints */}
        <section id="endpoints" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">API Endpoints</h2>
            <div className="space-y-6">
              {apiEndpoints.map((endpoint) => (
                <div key={endpoint.title} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-4 text-violet-400">{endpoint.title}</h3>
                  <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm text-neutral-300">
                    <code>{endpoint.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Features</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0" />
                  <span className="text-neutral-300">{feature}</span>
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
                <div key={useCase} className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-neutral-300">{useCase}</p>
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
            <h2 className="text-3xl font-medium mb-4">Lip Sync API Coming Soon</h2>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              We are actively developing the Lip Sync API to bring powerful audio-visual synchronization to your applications. Sign up now to be the first to know when it launches and get early access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Join the Waitlist
              </Link>
              <Link
                href="/ai-lipsync"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                Try AI Lip Sync Now
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
