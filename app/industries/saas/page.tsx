import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Monitor, Play, Users, Sparkles, Bell, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Video for SaaS - Demo Videos & Product Tours | blacktools.ai',
  description: 'Create SaaS marketing videos with AI. Product demos, feature tours, onboarding videos, testimonials. Scale content for every stage of the funnel. Try free.',
  keywords: 'AI SaaS video, product demo AI, SaaS marketing video, feature tour AI, onboarding video AI',
  alternates: {
    canonical: 'https://blacktools.ai/industries/saas',
  },
  openGraph: {
    title: 'AI Video for SaaS - Demo Videos & Product Tours',
    description: 'Create SaaS marketing videos with AI. Product demos, feature tours, onboarding videos.',
    url: 'https://blacktools.ai/industries/saas',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video for SaaS - Demo Videos & Product Tours',
    description: 'Create SaaS marketing videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const funnelStages = [
  {
    stage: 'Awareness',
    items: ['Explainer videos introducing your solution', 'Problem-focused content addressing pain points', 'Thought leadership and industry insights'],
  },
  {
    stage: 'Consideration',
    items: ['Product demos and feature tours', 'Comparison videos (vs competitors)', 'Customer testimonials and case studies'],
  },
  {
    stage: 'Conversion',
    items: ['Free trial onboarding', 'Feature highlights', 'Use case deep-dives'],
  },
  {
    stage: 'Retention',
    items: ['New feature announcements', 'Help and tutorial content', 'Customer success stories'],
  },
]

const videoTypes = [
  { title: 'Product Demos', description: 'AI presenters walking through your software with screen recordings.' },
  { title: 'Feature Tours', description: 'Highlight specific capabilities for different user segments.' },
  { title: 'Onboarding Videos', description: 'Welcome new users with guided walkthroughs.' },
  { title: 'Update Announcements', description: 'Keep users informed about new features.' },
  { title: 'Customer Stories', description: 'AI avatars presenting testimonial content.' },
]

const faqs = [
  {
    question: 'How can AI video help SaaS marketing?',
    answer: 'blacktools.ai creates marketing videos at scale—demos, testimonials, feature tours, and ads. Produce content for every stage of the funnel without a video production team.',
  },
  {
    question: 'Can AI create product demo videos?',
    answer: 'Yes. Combine screen recordings with AI presenters for professional demos. AI avatars can narrate features, explain benefits, and guide viewers through your product.',
  },
  {
    question: 'What video content drives SaaS conversions?',
    answer: 'Product demos and testimonials typically have the highest impact. Feature comparison videos also perform well for prospects evaluating alternatives.',
  },
]

export default function SaaSPage() {
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
        name: 'SaaS',
        item: 'https://blacktools.ai/industries/saas',
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
              <Link href="/ai-video-api" className="hover:text-white transition-colors">API</Link>
              <Link href="/industries/saas" className="text-white">SaaS</Link>
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
              <Monitor className="w-4 h-4 text-blue-500" />
              For SaaS Companies
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Video for SaaS
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Video Content for Every Stage of the Funnel
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Create product demos, feature tours, onboarding videos, and marketing content. AI-powered video for SaaS growth.
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
                href="#funnel"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                See SaaS Examples
              </Link>
            </div>
          </div>
        </section>

        {/* Funnel Stages */}
        <section id="funnel" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">SaaS Video Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {funnelStages.map((stage) => (
                <div key={stage.stage} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-4 text-blue-400">{stage.stage}</h3>
                  <ul className="space-y-2">
                    {stage.items.map((item, i) => (
                      <li key={i} className="text-sm text-neutral-400 flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Types */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">SaaS Video Types</h2>
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
            <h2 className="text-3xl font-medium mb-4">Scale Your SaaS Video Content</h2>
            <p className="text-neutral-400 mb-8">Demos, tours, and marketing videos—AI-powered.</p>
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
