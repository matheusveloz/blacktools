import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Smartphone, Play, Download, Bell, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Video for Mobile Apps - App Store Videos & Ads | blacktools.ai',
  description: 'Create mobile app marketing videos with AI. App Store previews, feature demos, user acquisition ads. Scale your app marketing content. Try free.',
  keywords: 'AI mobile app video, App Store video AI, app preview video, mobile UA ads, app marketing AI',
  alternates: {
    canonical: 'https://blacktools.ai/industries/mobile-apps',
  },
  openGraph: {
    title: 'AI Video for Mobile Apps - App Store Videos & Ads',
    description: 'Create mobile app marketing videos with AI. App Store previews, feature demos, UA ads.',
    url: 'https://blacktools.ai/industries/mobile-apps',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video for Mobile Apps - App Store Videos & Ads',
    description: 'Create mobile app marketing videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const videoTypes = [
  { title: 'App Store Previews', description: "Showcase your app's best features in store listings." },
  { title: 'User Acquisition Ads', description: 'Performance-focused ads for Facebook, TikTok, Google.' },
  { title: 'Feature Demos', description: 'Highlight specific functionality for different audiences.' },
  { title: 'Onboarding Videos', description: 'Help new users get started in the app.' },
  { title: 'Update Announcements', description: 'Promote new features to existing users.' },
]

const platforms = [
  { name: 'iOS App Store', description: '15-30 second previews in required formats.' },
  { name: 'Google Play', description: 'Feature graphics and promotional videos.' },
  { name: 'Facebook/Instagram', description: 'UA ads in feed, Stories, and Reels formats.' },
  { name: 'TikTok', description: 'Native-looking content for app promotion.' },
]

const faqs = [
  {
    question: 'How can AI help with mobile app marketing?',
    answer: 'blacktools.ai creates app marketing videos at scale—store previews, UA ads, feature demos. Test multiple ad variations to improve acquisition costs.',
  },
  {
    question: 'What video formats work for app UA?',
    answer: 'UGC-style testimonials and problem-solution ads typically perform best. blacktools.ai creates native-looking content that drives installs.',
  },
  {
    question: 'Can I create App Store preview videos?',
    answer: 'Yes. Generate videos in the exact formats and lengths required by iOS App Store and Google Play.',
  },
]

export default function MobileAppsPage() {
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
        name: 'Mobile Apps',
        item: 'https://blacktools.ai/industries/mobile-apps',
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
              <Link href="/ai-shorts-generator" className="hover:text-white transition-colors">Shorts</Link>
              <Link href="/industries/mobile-apps" className="text-white">Mobile Apps</Link>
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
              <Smartphone className="w-4 h-4 text-violet-500" />
              For Mobile App Developers
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Video for Mobile Apps
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Video Marketing for App Growth
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Create App Store previews, UA ads, and feature demos. AI-powered video content for mobile app marketing.
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
                See App Examples
              </Link>
            </div>
          </div>
        </section>

        {/* Video Types */}
        <section id="video-types" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Mobile App Video Types</h2>
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

        {/* Platform Optimization */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Platform Optimization</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <div key={platform.name} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <Download className="w-4 h-4 text-violet-400" />
                    {platform.name}
                  </h3>
                  <p className="text-sm text-neutral-400">{platform.description}</p>
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
            <h2 className="text-3xl font-medium mb-4">Grow Your App with AI Video</h2>
            <p className="text-neutral-400 mb-8">Store previews. UA ads. Feature demos.</p>
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
