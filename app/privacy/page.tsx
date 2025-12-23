import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Your privacy matters. Learn how blacktools.ai collects, uses, and protects your data. We never sell your personal information to third parties.',
  openGraph: {
    title: 'Privacy Policy - blacktools.ai',
    description: 'Learn how we protect your privacy and handle your data.',
    url: 'https://blacktools.ai/privacy',
  },
  alternates: {
    canonical: 'https://blacktools.ai/privacy',
  },
}

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-neutral-500 mb-12">
          Last updated: December 2024
        </p>

        <div className="prose prose-invert prose-neutral max-w-none">
          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">1. Introduction</h2>
            <p className="text-neutral-400 leading-relaxed">
              At blacktools.ai, we are committed to protecting your privacy and personal data.
              This Privacy Policy explains how we collect, use, store, and protect your information
              when you use our AI video generation platform. By using our services, you consent to
              the practices described in this policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">2. Data Controller</h2>
            <p className="text-neutral-400 leading-relaxed">
              blacktools.ai is the data controller responsible for processing your personal data.
              For any privacy-related inquiries, you can contact us at{' '}
              <a href="mailto:privacy@blacktools.ai" className="text-white hover:underline">
                privacy@blacktools.ai
              </a>
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">3. Information We Collect</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              We collect the following categories of personal data:
            </p>

            <h3 className="text-lg font-medium mb-3 text-white">Account Information</h3>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2 mb-4">
              <li>Name and email address</li>
              <li>Password (encrypted)</li>
              <li>Profile information</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 text-white">Payment Information</h3>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2 mb-4">
              <li>Billing address</li>
              <li>Payment method details (processed securely by Stripe)</li>
              <li>Transaction history</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 text-white">Usage Data</h3>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2 mb-4">
              <li>Service usage patterns and preferences</li>
              <li>Generated content metadata</li>
              <li>Credit usage history</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 text-white">Technical Data</h3>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Access times and referring URLs</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">4. How We Use Your Information</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              We use your personal data for the following purposes:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-neutral-400 mb-4">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 pr-4 text-white font-medium">Purpose</th>
                    <th className="text-left py-3 pr-4 text-white font-medium">Legal Basis</th>
                    <th className="text-left py-3 text-white font-medium">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 pr-4">Service provision</td>
                    <td className="py-3 pr-4">Contract performance</td>
                    <td className="py-3">Duration of account</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 pr-4">Payment processing</td>
                    <td className="py-3 pr-4">Contract performance</td>
                    <td className="py-3">10 years (legal requirement)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 pr-4">Service improvement</td>
                    <td className="py-3 pr-4">Legitimate interest</td>
                    <td className="py-3">3 years</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 pr-4">Marketing communications</td>
                    <td className="py-3 pr-4">Consent</td>
                    <td className="py-3">Until withdrawal</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 pr-4">Security and fraud prevention</td>
                    <td className="py-3 pr-4">Legitimate interest</td>
                    <td className="py-3">6 months</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">5. Data Sharing</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              We may share your personal data with:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li><strong className="text-white">Service Providers:</strong> Including cloud hosting (Supabase), payment processing (Stripe), and AI model providers</li>
              <li><strong className="text-white">Legal Authorities:</strong> When required by law or to protect our rights</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
            </ul>
            <p className="text-neutral-400 leading-relaxed mt-4">
              We do not sell your personal data to third parties.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">6. International Data Transfers</h2>
            <p className="text-neutral-400 leading-relaxed">
              Your data may be transferred to and processed in countries outside your jurisdiction.
              When we transfer data internationally, we ensure appropriate safeguards are in place,
              including Standard Contractual Clauses approved by relevant authorities and compliance
              with applicable data protection laws.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">7. Data Security</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments</li>
              <li>Access controls and monitoring</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">8. Your Rights</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              Depending on your jurisdiction, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
              <li><strong className="text-white">Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong className="text-white">Erasure:</strong> Request deletion of your data</li>
              <li><strong className="text-white">Restriction:</strong> Limit how we use your data</li>
              <li><strong className="text-white">Portability:</strong> Receive your data in a structured format</li>
              <li><strong className="text-white">Objection:</strong> Object to certain processing activities</li>
              <li><strong className="text-white">Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="text-neutral-400 leading-relaxed mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@blacktools.ai" className="text-white hover:underline">
                privacy@blacktools.ai
              </a>
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">9. Cookies</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-neutral-400 space-y-2">
              <li>Maintain your session and authentication</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve our services</li>
            </ul>
            <p className="text-neutral-400 leading-relaxed mt-4">
              You can manage cookie preferences through your browser settings. Note that disabling
              certain cookies may affect the functionality of our services.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">10. Children&apos;s Privacy</h2>
            <p className="text-neutral-400 leading-relaxed">
              Our services are not intended for individuals under 18 years of age. We do not
              knowingly collect personal data from children. If you believe we have collected
              data from a minor, please contact us immediately.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">11. Changes to This Policy</h2>
            <p className="text-neutral-400 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by email or through a notice on our platform. We encourage you to review this
              policy periodically.
            </p>
          </section>

          {/* Section 12 */}
          <section className="mb-12">
            <h2 className="text-xl font-medium mb-4 text-white">12. Contact Us</h2>
            <p className="text-neutral-400 leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices,
              please contact us:
            </p>
            <div className="mt-4 text-neutral-400">
              <p>Email: <a href="mailto:privacy@blacktools.ai" className="text-white hover:underline">privacy@blacktools.ai</a></p>
              <p className="mt-2">General inquiries: <a href="mailto:support@blacktools.ai" className="text-white hover:underline">support@blacktools.ai</a></p>
            </div>
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
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
