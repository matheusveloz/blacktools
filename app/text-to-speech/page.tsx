import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mic, Globe, Zap, Clock, Volume2, Settings, Languages, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Text to Speech - Natural Voices in 30+ Languages | blacktools.ai',
  description: 'Convert text to natural-sounding speech with AI. 100+ realistic voices, 30+ languages, emotion control. Perfect for video ads, content creation. Try free.',
  keywords: 'AI text to speech, TTS AI, AI voice generator, text to voice, AI voiceover, natural voice AI',
  alternates: {
    canonical: 'https://blacktools.ai/text-to-speech',
  },
  openGraph: {
    title: 'AI Text to Speech - Natural Voices in 30+ Languages',
    description: 'Convert text to natural-sounding speech with AI. 100+ realistic voices, 30+ languages.',
    url: 'https://blacktools.ai/text-to-speech',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Text to Speech - Natural Voices in 30+ Languages',
    description: 'Convert text to natural-sounding speech with AI. 100+ realistic voices.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const features = [
  {
    icon: Volume2,
    title: '100+ Natural AI Voices',
    description: 'Choose from a diverse library of male, female, and neutral voices. Each voice has unique characteristics—from energetic and youthful to calm and authoritative.',
  },
  {
    icon: Languages,
    title: '30+ Languages & Accents',
    description: 'Create content in English, Spanish, Portuguese, French, German, Japanese, Korean, Chinese, Arabic, Hindi, and many more. Each language features native-quality pronunciation.',
  },
  {
    icon: Settings,
    title: 'Emotion & Tone Control',
    description: 'Adjust the emotional tone of your voiceover—make it excited, serious, friendly, or professional. Control speed, pitch, and emphasis for perfect delivery.',
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Generate voiceovers in seconds, not hours. No recording studios, no voice actors, no scheduling—just type and generate.',
  },
]

const useCases = [
  { title: 'Video Ads', description: 'Create voiceovers for TikTok, Instagram, Facebook, and YouTube ads' },
  { title: 'Product Videos', description: 'Explain features and benefits with professional narration' },
  { title: 'E-Learning', description: 'Produce educational content at scale' },
  { title: 'Podcasts', description: 'Generate intro/outro segments or full episodes' },
  { title: 'IVR Systems', description: 'Create phone system prompts that sound human' },
]

const steps = [
  { step: 1, title: 'Enter Your Script', description: 'Type or paste the text you want converted to speech' },
  { step: 2, title: 'Choose a Voice', description: 'Select from 100+ AI voices that match your brand' },
  { step: 3, title: 'Adjust Settings', description: 'Fine-tune speed, tone, and emotion' },
  { step: 4, title: 'Generate & Download', description: 'Get your audio file in MP3 or WAV format' },
]

const faqs = [
  {
    question: 'What is the best AI text to speech tool?',
    answer: 'The best AI text to speech tool depends on your needs. For marketing and video content, blacktools.ai offers 100+ natural voices in 30+ languages with emotion control. Our TTS integrates seamlessly with our AI video tools for complete content creation.',
  },
  {
    question: 'Does AI text to speech sound natural?',
    answer: 'Yes. Modern AI TTS has advanced dramatically. blacktools.ai uses neural network technology that captures natural speech patterns, intonation, and rhythm. Most listeners cannot distinguish our AI voices from human recordings.',
  },
  {
    question: 'What languages does AI text to speech support?',
    answer: 'blacktools.ai supports 30+ languages including English (US, UK, Australian), Spanish, Portuguese, French, German, Italian, Japanese, Korean, Chinese (Mandarin, Cantonese), Arabic, Hindi, Russian, Dutch, and more.',
  },
  {
    question: 'Can I use AI voiceovers for commercial content?',
    answer: 'Yes. All voices on blacktools.ai are licensed for commercial use. You can use generated voiceovers in ads, videos, podcasts, and any other content without additional licensing fees.',
  },
  {
    question: 'How fast is AI text to speech generation?',
    answer: 'Most voiceovers generate in 5-15 seconds depending on length. A 30-second script typically generates in under 10 seconds.',
  },
]

export default function TextToSpeechPage() {
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
        name: 'Text to Speech',
        item: 'https://blacktools.ai/text-to-speech',
      },
    ],
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert Text to Speech with AI',
    description: 'Transform any script into professional voiceovers with AI text-to-speech technology.',
    step: steps.map((s) => ({
      '@type': 'HowToStep',
      position: s.step,
      name: s.title,
      text: s.description,
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
              blacktools<span className="text-neutral-500">.ai</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
              <Link href="/ai-ugc-generator" className="hover:text-white transition-colors">AI UGC</Link>
              <Link href="/ai-avatar-creator" className="hover:text-white transition-colors">AI Avatars</Link>
              <Link href="/text-to-speech" className="text-white">Text to Speech</Link>
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
              <Mic className="w-4 h-4 text-blue-500" />
              100+ Natural AI Voices
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Text to Speech
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Convert Text to Natural Voice in Seconds
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Transform any script into professional voiceovers with blacktools.ai&apos;s AI text-to-speech technology.
              Our voices sound human, not robotic—perfect for ads, videos, and content at scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Try Text to Speech Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                Hear Voice Samples
              </Link>
            </div>
          </div>
        </section>

        {/* What is TTS */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-6">What is AI Text to Speech?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                <strong className="text-white">AI Text to Speech (TTS)</strong> uses artificial intelligence to convert written text into spoken audio. Unlike old-school robotic voices, modern AI TTS creates natural-sounding speech with proper intonation, emotion, and pacing.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai offers <strong className="text-white">100+ AI voices</strong> across <strong className="text-white">30+ languages</strong>, giving you the flexibility to create voiceovers for any audience, any platform, any style.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Features</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <feature.icon className="w-6 h-6 text-neutral-400 flex-shrink-0 mt-1" />
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

        {/* How It Works */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-lg font-medium">
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
            <h2 className="text-3xl font-medium mb-4">Start Creating AI Voiceovers</h2>
            <p className="text-neutral-400 mb-8">100+ voices. 30+ languages. Natural sound.</p>
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
