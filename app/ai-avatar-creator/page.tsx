import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Zap, Globe, Users, Sparkles, Mic, Monitor, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Avatar Creator - Generate Realistic Talking Avatars | blacktools.ai',
  description: 'Create hyper-realistic AI avatars for video ads and content. 300+ ready-made avatars or create custom ones. Perfect lip-sync, natural expressions. Start free.',
  keywords: 'AI avatar creator, AI avatar generator, talking avatar AI, AI video avatar, digital avatar, AI spokesperson, AI actor',
  alternates: {
    canonical: 'https://blacktools.ai/ai-avatar-creator',
  },
  openGraph: {
    title: 'AI Avatar Creator - Generate Realistic Talking Avatars',
    description: 'Create hyper-realistic AI avatars for video ads and content. 300+ ready-made avatars or create custom ones.',
    url: 'https://blacktools.ai/ai-avatar-creator',
    siteName: 'blacktools.ai',
    type: 'website',
    images: [
      {
        url: 'https://blacktools.ai/og-avatar-creator.png',
        width: 1200,
        height: 630,
        alt: 'AI Avatar Creator - blacktools.ai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Avatar Creator - Generate Realistic Talking Avatars',
    description: 'Create hyper-realistic AI avatars with perfect lip-sync and natural expressions.',
    images: ['https://blacktools.ai/og-avatar-creator.png'],
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

const technologies = [
  {
    name: 'Sora 2',
    description: "OpenAI's text-to-video model for cinematic quality generation",
  },
  {
    name: 'Veo 3.1',
    description: "Google's high-fidelity video synthesis for any style",
  },
  {
    name: 'LipSync Engine',
    description: 'Proprietary technology for perfect audio-visual synchronization',
  },
  {
    name: 'NanoBanana 2',
    description: 'Unique digital character and avatar generation',
  },
  {
    name: 'InfiniteTalk',
    description: 'Endless AI-powered conversations and voiceovers',
  },
]

const features = [
  {
    icon: Sparkles,
    title: 'Natural Expressions',
    description: "Avatars display genuine emotions—surprise, enthusiasm, concern—matching your script's tone",
  },
  {
    icon: Mic,
    title: 'Perfect Lip-Sync',
    description: 'Industry-leading synchronization in 30+ languages without dubbing artifacts',
  },
  {
    icon: Globe,
    title: 'Voice Control',
    description: 'Adjust speed, tone, and emotion of AI-generated voices',
  },
  {
    icon: Monitor,
    title: 'Background Options',
    description: 'Studio, casual home, outdoor, office, or custom environments',
  },
]

const avatarCategories = [
  { label: 'Gen Z', description: 'Young, trendy influencer style' },
  { label: 'Millennials', description: 'Professional yet relatable' },
  { label: 'Gen X', description: 'Experienced and trustworthy' },
  { label: 'Boomers', description: 'Mature and authoritative' },
]

const faqs = [
  {
    question: 'What is the best AI avatar generator?',
    answer: 'The best AI avatar generator depends on your use case. For marketing videos and UGC ads, blacktools.ai offers the most comprehensive solution with 300+ avatars, advanced lip-sync, and integration with leading AI video models like Sora 2 and Veo 3.1. We combine multiple technologies for the highest quality output.',
  },
  {
    question: 'How realistic are AI avatars?',
    answer: 'Modern AI avatars have reached remarkable realism. blacktools.ai avatars feature natural facial expressions, accurate lip synchronization, and human-like movements. While very close observation may reveal AI generation, most viewers experience them as authentic, especially in typical social media viewing conditions.',
  },
  {
    question: 'Can I create a custom AI avatar of myself?',
    answer: 'Yes, blacktools.ai supports custom avatar creation on the Premium plan. You can create a digital version of yourself or design a unique brand spokesperson. Custom avatars require training time but result in a personalized AI avatar for your exclusive use.',
  },
  {
    question: 'What languages do AI avatars support?',
    answer: 'blacktools.ai avatars support 30+ languages with native-quality lip synchronization. This includes English, Spanish, Portuguese, French, German, Italian, Japanese, Korean, Chinese, Arabic, Hindi, and many more.',
  },
]

export default function AIAvatarCreatorPage() {
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
        name: 'AI Avatar Creator',
        item: 'https://blacktools.ai/ai-avatar-creator',
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
              blacktools.ai
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
              <Link href="/ai-ugc-generator" className="hover:text-white transition-colors">AI UGC</Link>
              <Link href="/ai-avatar-creator" className="text-white">AI Avatars</Link>
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
              <Users className="w-4 h-4 text-purple-500" />
              300+ Ready-to-Use AI Avatars
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Avatar Creator for Marketing Videos
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              AI Avatars That Look and Sound Real
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Create professional video content with hyper-realistic AI avatars.
              Perfect lip-sync, natural expressions, unlimited variations.
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
                href="#avatars"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                Browse Avatars
              </a>
            </div>
          </div>
        </section>

        {/* What Are AI Avatars */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-6">What Are AI Avatars?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                <strong className="text-white">AI avatars</strong> are digital representations of people created using artificial intelligence. These avatars can speak, express emotions, and deliver video content that looks remarkably human. At blacktools.ai, our avatars are powered by advanced AI models that capture natural facial movements, realistic lip synchronization, and authentic expressions.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                Unlike basic text-to-speech videos, our AI avatars feature full video generation using <strong className="text-white">Sora 2 and Veo 3.1 technology</strong>, combined with our proprietary LipSync engine for perfect audio-visual sync in any language.
              </p>
            </div>
          </div>
        </section>

        {/* Avatar Library */}
        <section id="avatars" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-4">Avatar Library</h2>
            <h3 className="text-xl text-neutral-400 mb-8">300+ Ready-to-Use Avatars</h3>

            <p className="text-neutral-400 mb-8">
              Our extensive avatar library covers every demographic you need to reach your target audience:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {avatarCategories.map((category) => (
                <div key={category.label} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h4 className="font-medium mb-1">{category.label}</h4>
                  <p className="text-sm text-neutral-400">{category.description}</p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10">
              <h3 className="text-xl font-medium mb-3">Custom Avatar Creation</h3>
              <p className="text-neutral-400">
                Want a unique brand spokesperson? Create custom AI avatars that represent your brand identity.
                Upload reference images or describe your ideal avatar, and our AI generates a unique digital
                persona for your exclusive use.
              </p>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Powered by Leading AI Models</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium">Technology</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {technologies.map((tech) => (
                    <tr key={tech.name} className="border-b border-white/5">
                      <td className="py-3 px-4 font-medium">{tech.name}</td>
                      <td className="py-3 px-4 text-neutral-400">{tech.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Key Features</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <feature.icon className="w-6 h-6 text-neutral-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3 text-neutral-400">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span><strong className="text-white">4K Export:</strong> High-resolution output for any platform or use case</span>
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
            <h2 className="text-3xl font-medium mb-4">Create Your First AI Avatar Video</h2>
            <p className="text-neutral-400 mb-8">300+ avatars ready to use. Start your free trial today.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="#avatars"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                Browse Avatars
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
