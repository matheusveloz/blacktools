import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read our terms and conditions. Learn about account registration, subscriptions, acceptable use, intellectual property, and your rights when using blacktools.ai.',
  openGraph: {
    title: 'Terms & Conditions - blacktools.ai',
    description: 'Terms and conditions for using blacktools.ai services.',
    url: 'https://blacktools.ai/terms',
  },
  alternates: {
    canonical: 'https://blacktools.ai/terms',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4">
          Terms & Conditions
        </h1>
        <p className="text-neutral-500 mb-12">
          Last updated: December 2024
        </p>

        <div className="prose prose-invert prose-neutral max-w-none">
          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">1. Introduction</h2>
            <p className="text-neutral-400 leading-relaxed">
              Welcome to blacktools.ai. These Terms and Conditions govern your use of our platform and services.
              By accessing or using blacktools.ai, you agree to be bound by these terms. If you do not agree
              to these terms, please do not use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">2. Services Description</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              blacktools.ai provides AI-powered video generation services, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li>Text-to-video generation (Sora 2, Veo 3.1)</li>
              <li>Audio-visual synchronization (LipSync)</li>
              <li>AI avatar and character generation (NanoBanana 2)</li>
              <li>AI-powered voiceovers (InfiniteTalk)</li>
              <li>Visual workflow editor for video creation pipelines</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">3. Account Registration</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              To access our services, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">4. Subscription and Payment</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              Our services are offered on a subscription basis:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li>Free trial period of 1 day with limited credits</li>
              <li>Monthly subscription plans with varying credit allocations</li>
              <li>Automatic renewal unless cancelled before the billing date</li>
              <li>Credits reset monthly and do not roll over to the next period</li>
              <li>Extra credits purchased separately do not expire</li>
            </ul>
            <p className="text-neutral-400 leading-relaxed mt-4">
              All payments are processed securely through Stripe. By subscribing, you authorize us to charge
              your payment method on a recurring basis until you cancel.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">5. Cancellation and Refunds</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              You may cancel your subscription at any time through your account settings or the Stripe customer portal.
              Upon cancellation:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li>Your subscription remains active until the end of the current billing period</li>
              <li>You retain access to remaining credits until they are exhausted</li>
              <li>No refunds are provided for partial months or unused credits</li>
              <li>Extra credits remain available until used, even after cancellation</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">6. Acceptable Use</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              You agree not to use our services to:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li>Create content that is illegal, harmful, or violates third-party rights</li>
              <li>Generate deepfakes or misleading content intended to deceive</li>
              <li>Produce content depicting minors inappropriately</li>
              <li>Infringe on intellectual property rights</li>
              <li>Distribute malware or engage in hacking activities</li>
              <li>Resell or redistribute our services without authorization</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">7. Intellectual Property</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              <strong className="text-white">Platform:</strong> All rights to the blacktools.ai platform, including
              software, design, and trademarks, remain our exclusive property.
            </p>
            <p className="text-neutral-400 leading-relaxed mb-4">
              <strong className="text-white">Generated Content:</strong> You retain ownership of content you create
              using our services, subject to:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li>Compliance with these terms and acceptable use policies</li>
              <li>Any limitations imposed by underlying AI model providers</li>
              <li>Our right to use anonymized data for service improvement</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">8. Service Availability</h2>
            <p className="text-neutral-400 leading-relaxed">
              We strive to maintain high service availability but do not guarantee uninterrupted access.
              Services may be temporarily unavailable due to maintenance, updates, or circumstances beyond
              our control. We will make reasonable efforts to notify users of planned maintenance.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">9. Limitation of Liability</h2>
            <p className="text-neutral-400 leading-relaxed">
              To the maximum extent permitted by law, blacktools.ai shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of profits, data,
              or business opportunities. Our total liability shall not exceed the amount paid by you in
              the twelve (12) months preceding the claim.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">10. Indemnification</h2>
            <p className="text-neutral-400 leading-relaxed">
              You agree to indemnify and hold harmless blacktools.ai, its affiliates, and their respective
              officers, directors, employees, and agents from any claims, damages, losses, or expenses
              arising from your use of our services or violation of these terms.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">11. Termination</h2>
            <p className="text-neutral-400 leading-relaxed">
              We reserve the right to suspend or terminate your account immediately if you violate these
              terms or engage in fraudulent activity. Upon termination, your right to use our services
              ceases immediately. Chargebacks or payment disputes may result in immediate account suspension.
            </p>
          </section>

          {/* Section 12 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">12. Modifications</h2>
            <p className="text-neutral-400 leading-relaxed">
              We may update these terms from time to time. We will notify users of significant changes
              via email or platform notification. Continued use of our services after changes constitutes
              acceptance of the modified terms.
            </p>
          </section>

          {/* Section 13 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">13. Governing Law</h2>
            <p className="text-neutral-400 leading-relaxed">
              These terms shall be governed by and construed in accordance with applicable laws.
              Any disputes shall be resolved through good-faith negotiation or, if necessary,
              through binding arbitration.
            </p>
          </section>

          {/* Section 14 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">14. Contact</h2>
            <p className="text-neutral-400 leading-relaxed">
              For questions about these terms, please contact us at{' '}
              <a href="mailto:support@blacktools.ai" className="text-white hover:underline">
                support@blacktools.ai
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">
            blacktools<span className="text-neutral-600">.ai</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
