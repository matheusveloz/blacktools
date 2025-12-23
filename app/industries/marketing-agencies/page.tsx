import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, Users, Layers, Shield, Code, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Video for Marketing Agencies - Scale Client Content | blacktools.ai',
  description: 'Create video content for agency clients with AI. White-label solution, bulk generation, client management. Scale your agency services. Try free.',
  keywords: 'AI video agency, white-label video AI, agency video production, client video content AI',
  alternates: {
    canonical: 'https://blacktools.ai/industries/marketing-agencies',
  },
  openGraph: {
    title: 'AI Video for Marketing Agencies - Scale Client Content',
    description: 'Create video content for agency clients with AI. White-label solution, bulk generation.',
    url: 'https://blacktools.ai/industries/marketing-agencies',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video for Marketing Agencies - Scale Client Content',
    description: 'Create video content for agency clients with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const agencyFeatures = [
  {
    icon: Shield,
    title: 'White-Label Output',
    description: 'Remove blacktools.ai branding. Deliver as your own.',
  },
  {
    icon: Layers,
    title: 'Bulk Generation',
    description: 'Create hundreds of videos for multiple clients efficiently.',
  },
  {
    icon: Building2,
    title: 'Client Workspaces',
    description: 'Organize projects by client with separate brand guidelines.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Multiple team members with role-based access.',
  },
  {
    icon: Code,
    title: 'API Integration',
    description: 'Connect with your existing tools and workflows.',
  },
]

const clientServices = [
  { title: 'Ad Creative', description: 'Unlimited ad variations for client campaigns.' },
  { title: 'Social Content', description: 'Consistent posting schedules without production delays.' },
  { title: 'Product Videos', description: 'E-commerce and SaaS client content.' },
  { title: 'Testimonial Videos', description: 'AI avatars for client case studies.' },
]

const faqs = [
  {
    question: 'How can agencies use AI video?',
    answer: 'blacktools.ai helps agencies scale video production. Create content for multiple clients, test more ad variations, and offer video services profitably.',
  },
  {
    question: 'Is there white-label available?',
    answer: 'Yes. Enterprise and agency plans include white-label export—no blacktools.ai branding on delivered videos.',
  },
  {
    question: 'Can I manage multiple clients?',
    answer: 'Yes. Create separate workspaces for each client with their own brand guidelines, avatars, and assets.',
  },
]

export default function MarketingAgenciesPage() {
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
        name: 'Marketing Agencies',
        item: 'https://blacktools.ai/industries/marketing-agencies',
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
              <Link href="/ai-ads" className="hover:text-white transition-colors">AI Ads</Link>
              <Link href="/ai-video-api" className="hover:text-white transition-colors">API</Link>
              <Link href="/industries/marketing-agencies" className="text-white">Agencies</Link>
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
              <Building2 className="w-4 h-4 text-pink-500" />
              For Marketing Agencies
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Video for Marketing Agencies
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Scale Your Video Services
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Create client video content at scale. White-label AI video for agencies of all sizes.
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
                href="#features"
                className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                Agency Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Agency Features */}
        <section id="features" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Agency Features</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {agencyFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <feature.icon className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Client Services */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Client Video Services</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {clientServices.map((service) => (
                <div key={service.title} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-1">{service.title}</h3>
                  <p className="text-sm text-neutral-400">{service.description}</p>
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
            <h2 className="text-3xl font-medium mb-4">Scale Your Agency with AI</h2>
            <p className="text-neutral-400 mb-8">More clients. More content. More profit.</p>
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
                Contact Sales
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
