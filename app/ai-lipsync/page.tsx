import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mic2, Globe, Sparkles, Monitor, Languages, Waves, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Lip Sync - Perfect Audio-Visual Synchronization | blacktools.ai',
  description: 'Sync any audio to video with AI lip sync technology. Perfect mouth movements in 30+ languages. Translate videos, dub content, create multilingual ads. Try free.',
  keywords: 'AI lip sync, lip sync AI, video lip sync, AI dubbing, speech to lip sync, talking head AI',
  alternates: {
    canonical: 'https://blacktools.ai/ai-lipsync',
  },
  openGraph: {
    title: 'AI Lip Sync - Perfect Audio-Visual Synchronization',
    description: 'Sync any audio to video with AI lip sync technology. Perfect mouth movements in 30+ languages.',
    url: 'https://blacktools.ai/ai-lipsync',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Lip Sync - Perfect Audio-Visual Synchronization',
    description: 'Sync any audio to video with AI lip sync technology.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const howItWorks = [
  {
    step: 1,
    title: 'Audio Analysis',
    description: 'AI analyzes the audio waveform to identify phonemes (speech sounds) and timing.',
  },
  {
    step: 2,
    title: 'Movement Mapping',
    description: 'The system maps each phoneme to corresponding mouth shapes and movements.',
  },
  {
    step: 3,
    title: 'Natural Generation',
    description: 'AI generates smooth, natural transitions between mouth positions, including subtle facial expressions.',
  },
  {
    step: 4,
    title: 'Perfect Sync',
    description: 'The final output is a video where mouth movements perfectly match the audio—in any language.',
  },
]

const features = [
  {
    icon: Languages,
    title: '30+ Language Support',
    description: 'Create lip-synced content in English, Spanish, Portuguese, French, German, Japanese, Korean, Chinese, Arabic, Hindi, and more. Each language has native-quality mouth movements.',
  },
  {
    icon: Sparkles,
    title: 'Works with AI Avatars',
    description: 'Combine with our 300+ AI avatars to create talking head videos from scratch.',
  },
  {
    icon: Monitor,
    title: 'Real Video Dubbing',
    description: 'Apply lip sync to existing video footage to create dubbed versions in new languages.',
  },
  {
    icon: Waves,
    title: 'Emotion Preservation',
    description: 'Our AI maintains natural facial expressions and emotions while adjusting lip movements.',
  },
  {
    icon: CheckCircle,
    title: 'High Resolution Output',
    description: 'Export in up to 4K quality with no visible artifacts or uncanny effects.',
  },
]

const useCases = [
  { title: 'Multilingual Ads', description: 'Create the same ad in 10+ languages without reshooting' },
  { title: 'Video Translation', description: 'Dub existing content into new markets' },
  { title: 'AI Avatars', description: 'Power talking head videos with natural speech' },
  { title: 'Content Localization', description: 'Reach global audiences with native-language content' },
  { title: 'Course Creation', description: 'Produce educational content in multiple languages' },
]

const faqs = [
  {
    question: 'What is AI lip sync technology?',
    answer: 'AI lip sync uses artificial intelligence to synchronize mouth movements with audio. The AI analyzes speech sounds and generates matching lip movements, creating realistic videos where the speaker appears to naturally say the words—even in languages they don\'t speak.',
  },
  {
    question: 'How accurate is AI lip sync?',
    answer: "blacktools.ai's lip sync technology achieves near-perfect accuracy. Our AI has been trained on millions of video samples to capture the subtle mouth movements and facial expressions that make speech look natural. Most viewers cannot tell the difference from real footage.",
  },
  {
    question: 'Can AI lip sync work in any language?',
    answer: 'Yes. blacktools.ai supports 30+ languages with native-quality lip synchronization. The AI understands the unique phonemes and mouth shapes of each language, ensuring accurate sync whether you\'re creating content in English, Japanese, Arabic, or any other supported language.',
  },
  {
    question: 'Can I use lip sync on my own videos?',
    answer: 'Yes. blacktools.ai can apply lip sync to existing video footage, allowing you to create dubbed versions of your content in new languages. This is perfect for translating ads, courses, or any video content.',
  },
  {
    question: "What's the difference between lip sync and dubbing?",
    answer: 'Traditional dubbing replaces audio but leaves the original mouth movements, creating an obvious mismatch. AI lip sync actually changes the mouth movements to match the new audio, creating a seamless result that looks natural.',
  },
]

export default function AILipsyncPage() {
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
        name: 'AI Lip Sync',
        item: 'https://blacktools.ai/ai-lipsync',
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
              <Link href="/ai-avatar-creator" className="hover:text-white transition-colors">AI Avatars</Link>
              <Link href="/ai-lipsync" className="text-white">Lip Sync</Link>
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
              <Mic2 className="w-4 h-4 text-purple-500" />
              30+ Languages Supported
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Lip Sync
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Perfect Audio-Visual Sync in Any Language
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Make any avatar or video speak any language with natural lip movements.
              Our AI lip sync technology creates seamless synchronization that looks completely real.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Try AI Lip Sync Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#demo"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                See Demo
              </Link>
            </div>
          </div>
        </section>

        {/* What is it */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-6">What is AI Lip Sync?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                <strong className="text-white">AI Lip Sync</strong> technology uses artificial intelligence to synchronize mouth movements with audio. The AI analyzes speech patterns and generates realistic lip movements that match the audio perfectly—creating the illusion that the person is actually speaking those words.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai&apos;s proprietary lip sync engine works with both AI avatars and real video footage, supporting <strong className="text-white">30+ languages</strong> with native-quality synchronization.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="demo" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">How Our Lip Sync Technology Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 text-xl font-medium">
                    {step.step}
                  </div>
                  <h3 className="font-medium mb-2">{step.title}</h3>
                  <p className="text-sm text-neutral-400">{step.description}</p>
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
                  <feature.icon className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
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

        {/* CTA */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-medium mb-4">Create Perfect Lip Sync Videos</h2>
            <p className="text-neutral-400 mb-8">30+ languages. Natural movements. Seamless sync.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Try Free
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
