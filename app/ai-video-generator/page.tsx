import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Video, Sparkles, Users, Layers, Globe, Monitor, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Video Generator - Create Videos with Sora 2 & Veo 3.1 | blacktools.ai',
  description: 'Generate professional videos with AI. Powered by Sora 2 and Veo 3.1. Text to video, AI avatars, lip sync. Create marketing videos in minutes. Try free.',
  keywords: 'AI video generator, Sora 2, Veo 3.1, text to video AI, AI video maker, AI video creation',
  alternates: {
    canonical: 'https://blacktools.ai/ai-video-generator',
  },
  openGraph: {
    title: 'AI Video Generator - Create Videos with Sora 2 & Veo 3.1',
    description: 'Generate professional videos with AI. Powered by Sora 2 and Veo 3.1.',
    url: 'https://blacktools.ai/ai-video-generator',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video Generator - Create Videos with Sora 2 & Veo 3.1',
    description: 'Generate professional videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const technologies = [
  {
    name: 'Sora 2 (OpenAI)',
    description: 'Text-to-video generation with cinematic quality. Create realistic scenes, actions, and environments from descriptions.',
  },
  {
    name: 'Veo 3.1 (Google)',
    description: 'High-fidelity video synthesis supporting any style—from realistic to animated, from corporate to creative.',
  },
  {
    name: 'Proprietary LipSync',
    description: 'Industry-leading audio-visual synchronization for talking head videos in 30+ languages.',
  },
  {
    name: 'NanoBanana 2',
    description: 'Unique character and avatar generation for distinctive digital personas.',
  },
  {
    name: 'InfiniteTalk',
    description: 'Extended conversation and voiceover capabilities for long-form content.',
  },
]

const videoTypes = [
  { title: 'Text to Video', description: 'Describe a scene and watch it come to life. "A professional woman explaining a product in a modern office."' },
  { title: 'Avatar Videos', description: '300+ AI avatars delivering scripts with natural expressions and perfect lip sync.' },
  { title: 'Product Videos', description: 'Transform product images into dynamic video content with AI presenters.' },
  { title: 'UGC-Style Ads', description: 'Authentic-looking user-generated content for social media advertising.' },
  { title: 'Animated Explainers', description: 'Visual storytelling with AI-generated animations and graphics.' },
]

const features = [
  {
    icon: Layers,
    title: 'Multiple AI Models',
    description: 'Access Sora 2, Veo 3.1, and more from one platform. Choose the best model for each project.',
  },
  {
    icon: Zap,
    title: 'Batch Processing',
    description: 'Generate multiple videos simultaneously. Create dozens of variations in parallel.',
  },
  {
    icon: Monitor,
    title: '4K Export',
    description: 'High-resolution output for any use case—ads, websites, presentations.',
  },
  {
    icon: Globe,
    title: '30+ Languages',
    description: 'Create content in any language with native-quality voiceovers and lip sync.',
  },
  {
    icon: Sparkles,
    title: 'No Watermarks',
    description: 'All paid plans include clean exports with no branding or watermarks.',
  },
]

const faqs = [
  {
    question: 'What is the best AI video generator?',
    answer: 'blacktools.ai offers access to multiple leading AI models (Sora 2, Veo 3.1) plus proprietary lip sync technology. This combination delivers the highest quality AI video generation available, suitable for professional marketing and content creation.',
  },
  {
    question: 'Can AI generate realistic videos?',
    answer: "Yes. Modern AI video generators like Sora 2 and Veo 3.1 can create remarkably realistic footage. Combined with blacktools.ai's 300+ AI avatars and lip sync, you can create professional videos indistinguishable from traditional production.",
  },
  {
    question: "What's the difference between Sora 2 and Veo 3.1?",
    answer: 'Sora 2 (OpenAI) excels at cinematic, realistic video generation. Veo 3.1 (Google) offers versatile style options from realistic to animated. blacktools.ai gives you access to both, letting you choose the best model for each project.',
  },
  {
    question: 'How long can AI-generated videos be?',
    answer: 'blacktools.ai supports videos from short clips (5-15 seconds) to longer content (60+ seconds). For longer videos, you can generate segments and combine them or use our extended generation features.',
  },
  {
    question: 'Is AI video generation expensive?',
    answer: 'blacktools.ai makes AI video accessible starting at $24.50/month. This is a fraction of traditional video production costs, which can run $500-5,000+ per video.',
  },
]

export default function AIVideoGeneratorPage() {
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
        name: 'AI Video Generator',
        item: 'https://blacktools.ai/ai-video-generator',
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
              <Link href="/ai-video-generator" className="text-white">Video Generator</Link>
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
              <Video className="w-4 h-4 text-cyan-500" />
              Powered by Sora 2 & Veo 3.1
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Video Generator
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Create Professional Videos with AI
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Powered by Sora 2 and Veo 3.1—the most advanced AI video models. Generate stunning videos from text, images, or scripts in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Start Generating Videos
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
            <h2 className="text-3xl font-medium mb-6">What is an AI Video Generator?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                An <strong className="text-white">AI Video Generator</strong> uses artificial intelligence to create video content from text descriptions, images, or scripts. The latest AI models can generate photorealistic scenes, animations, and talking head videos that were previously impossible without expensive production.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai combines <strong className="text-white">Sora 2, Veo 3.1, and proprietary technology</strong> to offer the most comprehensive AI video generation platform.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section id="examples" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Our AI Technology Stack</h2>
            <div className="space-y-4">
              {technologies.map((tech) => (
                <div key={tech.name} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-1 text-cyan-400">{tech.name}</h3>
                  <p className="text-sm text-neutral-400">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Types */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Video Types You Can Create</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {videoTypes.map((type) => (
                <div key={type.title} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-2">{type.title}</h3>
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
                  <feature.icon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
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
            <h2 className="text-3xl font-medium mb-4">Start Creating AI Videos</h2>
            <p className="text-neutral-400 mb-8">Sora 2. Veo 3.1. Infinite possibilities.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Generate Free Video
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
