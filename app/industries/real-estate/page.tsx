import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Home, Play, Camera, Users, MapPin, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Video for Real Estate - Property Tours & Agent Videos | blacktools.ai',
  description: 'Create real estate marketing videos with AI. Virtual property tours, agent introduction videos, listing presentations. Stand out in competitive markets. Try free.',
  keywords: 'AI real estate video, property tour video AI, real estate agent video, listing video AI',
  alternates: {
    canonical: 'https://blacktools.ai/industries/real-estate',
  },
  openGraph: {
    title: 'AI Video for Real Estate - Property Tours & Agent Videos',
    description: 'Create real estate marketing videos with AI. Virtual property tours, agent introductions.',
    url: 'https://blacktools.ai/industries/real-estate',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video for Real Estate - Property Tours & Agent Videos',
    description: 'Create real estate marketing videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const videoTypes = [
  { title: 'Property Tours', description: 'AI-narrated walkthroughs highlighting property features.' },
  { title: 'Agent Introductions', description: 'Personal branding videos for agents and teams.' },
  { title: 'Listing Presentations', description: 'Professional videos for seller meetings.' },
  { title: 'Neighborhood Guides', description: 'Area overviews with local highlights.' },
  { title: 'Market Updates', description: 'Regular video content on local market trends.' },
]

const benefits = [
  {
    icon: Camera,
    title: 'Professional Quality',
    description: 'Polished videos that showcase properties at their best.',
  },
  {
    icon: Users,
    title: 'Personal Branding',
    description: 'AI avatars that represent your professional image.',
  },
  {
    icon: MapPin,
    title: 'Local Expertise',
    description: 'Highlight neighborhood knowledge and area benefits.',
  },
]

const faqs = [
  {
    question: 'How can real estate agents use AI video?',
    answer: 'blacktools.ai creates property tours, agent introduction videos, and market updates. AI video helps agents stand out, build personal brands, and market listings effectively.',
  },
  {
    question: 'Can AI create property tour videos?',
    answer: 'Yes. Combine property photos or footage with AI narration. AI avatars can highlight features, discuss neighborhoods, and present listings professionally.',
  },
  {
    question: 'Is AI video professional enough for real estate?',
    answer: 'AI-generated videos are now indistinguishable from traditional production. Many successful agents use AI video for consistent, high-quality marketing at scale.',
  },
]

export default function RealEstatePage() {
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
        name: 'Industries',
        item: 'https://blacktools.ai/industries',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Real Estate',
        item: 'https://blacktools.ai/industries/real-estate',
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
              <Link href="/ai-lipsync" className="hover:text-white transition-colors">Lip Sync</Link>
              <Link href="/industries/real-estate" className="text-white">Real Estate</Link>
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
              <Home className="w-4 h-4 text-amber-500" />
              For Real Estate Professionals
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Video for Real Estate
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Stand Out in Competitive Markets
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Create property tours, agent introductions, and listing presentations. AI video for real estate marketing that converts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Start Creating Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#video-types"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                See Examples
              </Link>
            </div>
          </div>
        </section>

        {/* Video Types */}
        <section id="video-types" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Real Estate Video Types</h2>
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

        {/* Benefits */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Why AI Video for Real Estate</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <benefit.icon className="w-10 h-10 text-amber-400 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">{benefit.title}</h3>
                  <p className="text-sm text-neutral-400">{benefit.description}</p>
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
            <h2 className="text-3xl font-medium mb-4">Elevate Your Real Estate Marketing</h2>
            <p className="text-neutral-400 mb-8">Property tours, agent videos, listing content—AI-powered.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Start Free
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
