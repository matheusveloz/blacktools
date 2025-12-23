import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Scale, Users, FileText, Shield, Video, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Video for Law Firms - Legal Marketing Videos | blacktools.ai',
  description: 'Create law firm marketing videos with AI. Attorney introductions, practice area explainers, client testimonials. Professional legal video content. Try free.',
  keywords: 'AI law firm video, legal marketing video, attorney introduction video, law firm video AI',
  alternates: {
    canonical: 'https://blacktools.ai/industries/law-firm',
  },
  openGraph: {
    title: 'AI Video for Law Firms - Legal Marketing Videos',
    description: 'Create law firm marketing videos with AI. Attorney introductions, practice area explainers.',
    url: 'https://blacktools.ai/industries/law-firm',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video for Law Firms - Legal Marketing Videos',
    description: 'Create law firm marketing videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const videoTypes = [
  { title: 'Attorney Introductions', description: 'Personal videos introducing lawyers and their expertise.' },
  { title: 'Practice Area Explainers', description: 'Educational content on legal services offered.' },
  { title: 'Client FAQs', description: 'Answer common legal questions with video content.' },
  { title: 'Case Study Videos', description: 'AI-presented success stories (with appropriate disclaimers).' },
  { title: 'Firm Culture Videos', description: 'Showcase your firm\'s values and approach.' },
]

const benefits = [
  {
    icon: Shield,
    title: 'Professional Presentation',
    description: 'Polished, authoritative video content for legal marketing.',
  },
  {
    icon: Users,
    title: 'Build Trust',
    description: 'Video helps potential clients connect with attorneys before calling.',
  },
  {
    icon: FileText,
    title: 'Educational Content',
    description: 'Explain complex legal topics in accessible video format.',
  },
]

const practiceAreas = [
  'Personal Injury',
  'Family Law',
  'Criminal Defense',
  'Business Law',
  'Estate Planning',
  'Immigration',
]

const faqs = [
  {
    question: 'How can law firms use AI video?',
    answer: 'blacktools.ai creates attorney introductions, practice area explainers, and educational content. Video helps law firms build trust with potential clients before the first consultation.',
  },
  {
    question: 'Is AI video appropriate for legal marketing?',
    answer: 'Yes. Professional AI avatars deliver polished presentations. Many law firms use AI video for educational content while reserving in-person communication for client consultations.',
  },
  {
    question: 'What legal marketing videos convert best?',
    answer: 'Attorney introduction videos and practice area explainers typically drive the most engagement. FAQ videos addressing common legal questions also perform well for SEO and client education.',
  },
]

export default function LawFirmPage() {
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
        name: 'Law Firms',
        item: 'https://blacktools.ai/industries/law-firm',
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
              <Link href="/talking-ai-avatar" className="hover:text-white transition-colors">Talking Avatar</Link>
              <Link href="/industries/law-firm" className="text-white">Law Firms</Link>
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
              <Scale className="w-4 h-4 text-indigo-500" />
              For Law Firms
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Video for Law Firms
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Professional Legal Marketing Videos
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Create attorney introductions, practice area explainers, and educational content. AI video for law firm marketing that builds trust.
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
            <h2 className="text-3xl font-medium mb-8 text-center">Legal Video Types</h2>
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
            <h2 className="text-3xl font-medium mb-12 text-center">Why AI Video for Law Firms</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <benefit.icon className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">{benefit.title}</h3>
                  <p className="text-sm text-neutral-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Practice Areas */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Videos for Every Practice Area</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {practiceAreas.map((area) => (
                <div key={area} className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-neutral-300">{area}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-neutral-500 mt-6 text-sm">
              Create custom videos for any practice area or legal specialty.
            </p>
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
            <h2 className="text-3xl font-medium mb-4">Grow Your Law Practice with Video</h2>
            <p className="text-neutral-400 mb-8">Attorney intros, practice explainers, educational content—AI-powered.</p>
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
