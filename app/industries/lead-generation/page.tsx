import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Target, Video, Users, TrendingUp, Mail, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Video for Lead Generation - Convert More Leads | blacktools.ai',
  description: 'Create lead generation videos with AI. Landing page videos, webinar promos, case studies. Increase conversions with professional video content. Try free.',
  keywords: 'AI lead generation video, landing page video AI, lead magnet video, B2B video marketing AI',
  alternates: {
    canonical: 'https://blacktools.ai/industries/lead-generation',
  },
  openGraph: {
    title: 'AI Video for Lead Generation - Convert More Leads',
    description: 'Create lead generation videos with AI. Landing page videos, webinar promos, case studies.',
    url: 'https://blacktools.ai/industries/lead-generation',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video for Lead Generation - Convert More Leads',
    description: 'Create lead generation videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const videoTypes = [
  { title: 'Landing Page Videos', description: 'Explain your offer and drive form completions.' },
  { title: 'Webinar Promotions', description: 'AI presenters inviting viewers to register.' },
  { title: 'Lead Magnet Previews', description: 'Showcase what leads will receive.' },
  { title: 'Case Studies', description: 'AI avatars presenting customer success stories.' },
  { title: 'Demo Request Videos', description: 'Encourage prospects to book calls.' },
]

const funnelContent = [
  {
    stage: 'Top of Funnel',
    items: ['Educational content', 'Industry insights', 'Problem awareness'],
  },
  {
    stage: 'Middle of Funnel',
    items: ['Solution comparisons', 'Feature deep-dives', 'Case studies'],
  },
  {
    stage: 'Bottom of Funnel',
    items: ['Demo offers', 'Trial invitations', 'Consultation CTAs'],
  },
]

const faqs = [
  {
    question: 'How does video improve lead generation?',
    answer: 'Video increases engagement and trust. Landing pages with video convert 80% better. AI video lets you create professional content affordably at scale.',
  },
  {
    question: 'What video types work best for B2B leads?',
    answer: 'Explainer videos for landing pages, customer testimonials, and personalized demo invitations typically drive the best lead gen results.',
  },
]

export default function LeadGenerationPage() {
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
        name: 'Lead Generation',
        item: 'https://blacktools.ai/industries/lead-generation',
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
              <Link href="/ai-ads" className="hover:text-white transition-colors">AI Ads</Link>
              <Link href="/industries/lead-generation" className="text-white">Lead Gen</Link>
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
              <Target className="w-4 h-4 text-orange-500" />
              For Lead Generation
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Video for Lead Generation
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Convert More Visitors into Leads
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Video increases landing page conversions by up to 80%. Create professional lead gen video content with AI.
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
            <h2 className="text-3xl font-medium mb-8 text-center">Lead Gen Video Types</h2>
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

        {/* Funnel Content */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Video by Funnel Stage</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {funnelContent.map((stage) => (
                <div key={stage.stage} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-4 text-orange-400">{stage.stage}</h3>
                  <ul className="space-y-2">
                    {stage.items.map((item, i) => (
                      <li key={i} className="text-sm text-neutral-400 flex items-start gap-2">
                        <span className="text-orange-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
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
            <h2 className="text-3xl font-medium mb-4">Generate More Leads with Video</h2>
            <p className="text-neutral-400 mb-8">Landing pages, webinars, case studies—AI-powered.</p>
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
