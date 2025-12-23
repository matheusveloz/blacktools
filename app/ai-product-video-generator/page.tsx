import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Package, Link2, Image, Users, Layers, Repeat, ShoppingBag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Product Video Generator - Create Product Videos in Minutes | blacktools.ai',
  description: 'Generate professional product videos with AI. Demos, explainers, ads from product images or URLs. Perfect for e-commerce and SaaS. No filming needed. Try free.',
  keywords: 'AI product video generator, product video maker AI, e-commerce video AI, product demo AI, AI video from URL',
  alternates: {
    canonical: 'https://blacktools.ai/ai-product-video-generator',
  },
  openGraph: {
    title: 'AI Product Video Generator - Create Product Videos in Minutes',
    description: 'Generate professional product videos with AI. Demos, explainers, ads from product images or URLs.',
    url: 'https://blacktools.ai/ai-product-video-generator',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Product Video Generator - Create Product Videos in Minutes',
    description: 'Generate professional product videos with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const urlToVideo = [
  { step: 1, text: 'Paste your product URL' },
  { step: 2, text: 'AI extracts product info, images, and features' },
  { step: 3, text: 'Choose video style (demo, testimonial, comparison)' },
  { step: 4, text: 'AI generates professional product video' },
]

const imageToVideo = [
  { step: 1, text: 'Upload product images' },
  { step: 2, text: 'Enter product details and key benefits' },
  { step: 3, text: 'Select an AI avatar to present' },
  { step: 4, text: 'Generate video with avatar showcasing your product' },
]

const features = [
  {
    icon: Link2,
    title: 'Smart Product Analysis',
    description: 'AI analyzes your product page to extract key features, benefits, and selling points automatically.',
  },
  {
    icon: Layers,
    title: 'Multiple Video Styles',
    description: 'Product Demo, Testimonial, Comparison, Unboxing, Problem-Solution—choose the format that works best.',
  },
  {
    icon: Users,
    title: 'Avatar + Product Combinations',
    description: 'AI avatars can hold, point to, and interact with product images—creating dynamic presentation videos.',
  },
  {
    icon: Repeat,
    title: 'Bulk Generation',
    description: 'Create videos for your entire product catalog. Upload a CSV with product URLs and generate hundreds of videos.',
  },
]

const videoStyles = [
  { title: 'Product Demo', description: 'Features and how it works' },
  { title: 'Testimonial', description: 'AI avatar sharing experience' },
  { title: 'Comparison', description: 'Your product vs alternatives' },
  { title: 'Unboxing', description: 'First impressions style' },
  { title: 'Problem-Solution', description: 'Pain point to solution' },
]

const useCases = [
  {
    category: 'E-Commerce',
    items: ['Product listing videos for Amazon, Shopify', 'Social media ads for each product', 'Email marketing video content'],
  },
  {
    category: 'SaaS & Apps',
    items: ['Feature explainer videos', 'Onboarding walkthroughs', 'Update announcements'],
  },
  {
    category: 'Dropshipping',
    items: ['Quick videos for product testing', 'Winning product showcases', 'Ad creative at scale'],
  },
]

const faqs = [
  {
    question: 'What is the best AI product video generator?',
    answer: 'blacktools.ai offers comprehensive product video generation from URLs or images. Our AI analyzes your product automatically, creates multiple video styles (demos, testimonials, comparisons), and features AI avatars that can present your product naturally.',
  },
  {
    question: 'Can AI create product videos from a URL?',
    answer: "Yes. blacktools.ai's URL-to-Video feature analyzes your product page, extracts images and information, and generates professional videos automatically. Just paste your product URL and choose your video style.",
  },
  {
    question: 'How do AI avatars interact with products?',
    answer: 'Our AI generates videos where avatars appear to hold, present, and demonstrate your product. The AI composites product images naturally into scenes, creating the effect of real product demonstrations.',
  },
  {
    question: 'Can I create videos for my entire product catalog?',
    answer: 'Yes. blacktools.ai supports bulk generation. Upload a CSV with product URLs and generate videos for hundreds of products automatically—perfect for e-commerce stores with large catalogs.',
  },
  {
    question: 'What video styles work best for products?',
    answer: 'It depends on your platform and goal. For ads, testimonial and problem-solution styles often convert best. For product pages, demo and feature videos work well. blacktools.ai lets you test multiple styles easily.',
  },
]

export default function AIProductVideoGeneratorPage() {
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
        name: 'AI Product Video Generator',
        item: 'https://blacktools.ai/ai-product-video-generator',
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
              <Link href="/ai-product-video-generator" className="text-white">Product Videos</Link>
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
              <Package className="w-4 h-4 text-orange-500" />
              URL to Video in Minutes
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
              AI Product Video Generator
            </h1>
            <p className="text-xl text-neutral-400 mb-4">
              Turn Any Product Into a Video Ad
            </p>
            <p className="text-neutral-500 max-w-2xl mx-auto mb-8">
              Generate professional product videos from just a URL or image. AI creates demos, explainers, and ads that showcase your product—no filming required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Create Product Video Free
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
            <h2 className="text-3xl font-medium mb-6">What is an AI Product Video Generator?</h2>
            <div className="prose prose-invert prose-neutral max-w-none">
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                An <strong className="text-white">AI Product Video Generator</strong> creates video content about your product using artificial intelligence. Simply provide your product URL, images, or description, and AI generates professional videos featuring AI avatars demonstrating and explaining your product.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                blacktools.ai combines <strong className="text-white">product analysis, AI avatars, and video synthesis</strong> to create compelling product content at scale.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="examples" className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <Link2 className="w-6 h-6 text-orange-400" />
                  <h3 className="text-xl font-medium">URL to Video</h3>
                </div>
                <ol className="space-y-4">
                  {urlToVideo.map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm flex-shrink-0">
                        {item.step}
                      </span>
                      <span className="text-neutral-400">{item.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <Image className="w-6 h-6 text-orange-400" />
                  <h3 className="text-xl font-medium">Image to Video</h3>
                </div>
                <ol className="space-y-4">
                  {imageToVideo.map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm flex-shrink-0">
                        {item.step}
                      </span>
                      <span className="text-neutral-400">{item.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
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
                  <feature.icon className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Styles */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-8 text-center">Video Styles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videoStyles.map((style) => (
                <div key={style.title} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-medium mb-1">{style.title}</h3>
                  <p className="text-sm text-neutral-400">{style.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center">Use Cases</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase) => (
                <div key={useCase.category}>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-orange-400" />
                    {useCase.category}
                  </h3>
                  <ul className="space-y-2">
                    {useCase.items.map((item, i) => (
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
            <h2 className="text-3xl font-medium mb-4">Start Creating Product Videos</h2>
            <p className="text-neutral-400 mb-8">URL to video in minutes. No filming required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                Create Free Video
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
