import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MessageCircle, Sparkles, Mic, Globe, Users, Video } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Talking AI Avatar - Realistic AI Spokespersons | blacktools.ai',
  description: 'Create talking AI avatars for videos. Hyper-realistic digital spokespersons with natural speech and expressions. 300+ avatars, 30+ languages. Try free.',
  keywords: 'talking AI avatar, AI spokesperson, digital presenter, AI talking head, virtual presenter',
  alternates: {
    canonical: 'https://blacktools.ai/talking-ai-avatar',
  },
  openGraph: {
    title: 'Talking AI Avatar - Realistic AI Spokespersons',
    description: 'Create talking AI avatars for videos. Hyper-realistic digital spokespersons with natural speech.',
    url: 'https://blacktools.ai/talking-ai-avatar',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Talking AI Avatar - Realistic AI Spokespersons',
    description: 'Create talking AI avatars for videos.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const capabilities = [
  {
    icon: MessageCircle,
    title: 'Natural Speech',
    description: 'Avatars speak with realistic intonation, pacing, and emphasis.',
  },
  {
    icon: Sparkles,
    title: 'Emotional Range',
    description: 'Express excitement, concern, friendliness, authority—matching your message.',
  },
  {
    icon: Mic,
    title: 'Perfect Lip Sync',
    description: 'Industry-leading synchronization in any language.',
  },
  {
    icon: Users,
    title: 'Consistent Identity',
    description: 'Same avatar across all your content for brand recognition.',
  },
]

const useCases = [
  { title: 'Marketing Videos', description: 'Brand spokesperson content' },
  { title: 'Training', description: 'Consistent presenter for courses' },
  { title: 'Customer Service', description: 'FAQ and help videos' },
  { title: 'Internal Comms', description: 'Company announcements' },
  { title: 'Social Media', description: 'Regular content with familiar face' },
]

const faqs = [
  {
    question: 'What is a talking AI avatar?',
    answer: 'A talking AI avatar is a digital character that can speak any script you provide. blacktools.ai avatars feature natural lip synchronization, facial expressions, and human-like delivery—perfect for professional video content.',
  },
  {
    question: 'How realistic are talking AI avatars?',
    answer: 'Very realistic. Our avatars feature accurate lip sync, natural expressions, and smooth movements. Most viewers perceive them as real people in typical viewing conditions.',
  },
  {
    question: 'Can talking avatars speak multiple languages?',
    answer: 'Yes. Every avatar can speak 30+ languages with native-quality pronunciation and lip sync.',
  },
]

export default function TalkingAIAvatarPage() {
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
        name: 'Talking AI Avatar',
        item: 'https://blacktools.ai/talking-ai-avatar',
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
              <Link href="/ai-avatar-creator" className="hover:text-white transition-colors">AI Avatars</Link>
              <Link href="/ai-actors" className="hover:text-white transition-colors">AI Actors</Link>
              <Link href="/talking-ai-avatar" className="text-white">Talking Avatar</Link>
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
              <Video className="w-4 h-4 text-rose-500" />
              300+ Realistic Avatars
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              Talking AI Avatar
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Digital Spokespersons That Look Real
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Create videos with hyper-realistic AI avatars that speak naturally. Your message, delivered by lifelike digital presenters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Create Talking Avatar Video
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#capabilities"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                Browse Avatars
              </Link>
            </div>
          </div>
        </section>

        {/* What is it */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-6">What is a Talking AI Avatar?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                A <strong className="text-white">Talking AI Avatar</strong> is a digital character that can speak any script with natural lip movements and expressions. These AI-generated presenters look remarkably human, making them perfect for professional video content.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai offers <strong className="text-white">300+ talking avatars</strong> with industry-leading lip sync in <strong className="text-white">30+ languages</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section id="capabilities" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Avatar Capabilities</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {capabilities.map((cap) => (
                <div key={cap.title} className="flex gap-4">
                  <cap.icon className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">{cap.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{cap.description}</p>
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
            <h2 className="text-3xl font-medium mb-4">Meet Your Digital Presenter</h2>
            <p className="text-neutral-400 mb-8">300+ avatars. Natural speech. Professional results.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Create Video
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
