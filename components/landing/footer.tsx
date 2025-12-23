'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Features Column */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Features</h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/ai-ugc-generator" className="hover:text-white transition-colors">
                  AI UGC Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-avatar-creator" className="hover:text-white transition-colors">
                  AI Avatars
                </Link>
              </li>
              <li>
                <Link href="/text-to-speech" className="hover:text-white transition-colors">
                  Text to speech
                </Link>
              </li>
              <li>
                <Link href="/ai-facebook-ad-generator" className="hover:text-white transition-colors">
                  AI Facebook Ad Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-tiktok-ad-generator" className="hover:text-white transition-colors">
                  AI Tik-Tok Ad Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-lipsync" className="hover:text-white transition-colors">
                  AI Lip-sync
                </Link>
              </li>
              <li>
                <Link href="/ai-product-video-generator" className="hover:text-white transition-colors">
                  AI Product Video Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-actors" className="hover:text-white transition-colors">
                  AI Actors
                </Link>
              </li>
              <li>
                <Link href="/ai-ads" className="hover:text-white transition-colors">
                  AI Ads
                </Link>
              </li>
              <li>
                <Link href="/ai-video-generator" className="hover:text-white transition-colors">
                  AI Ad Video Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-shorts-generator" className="hover:text-white transition-colors">
                  AI Shorts Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-content-generator" className="hover:text-white transition-colors">
                  AI Content Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-for-affiliate" className="hover:text-white transition-colors">
                  AI for Affiliate
                </Link>
              </li>
              <li>
                <Link href="/talking-ai-avatar" className="hover:text-white transition-colors">
                  Talking AI Avatar
                </Link>
              </li>
            </ul>
          </div>

          {/* Industries Column */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Industries</h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/industries/ecommerce" className="hover:text-white transition-colors">
                  E-Commerce
                </Link>
              </li>
              <li>
                <Link href="/industries/saas" className="hover:text-white transition-colors">
                  SaaS
                </Link>
              </li>
              <li>
                <Link href="/industries/mobile-apps" className="hover:text-white transition-colors">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link href="/industries/lead-generation" className="hover:text-white transition-colors">
                  Lead Generation
                </Link>
              </li>
              <li>
                <Link href="/industries/marketing-agencies" className="hover:text-white transition-colors">
                  Marketing Agencies
                </Link>
              </li>
              <li>
                <Link href="/industries/insurance" className="hover:text-white transition-colors">
                  Insurance
                </Link>
              </li>
              <li>
                <Link href="/industries/real-estate" className="hover:text-white transition-colors">
                  Real Estate Agencies
                </Link>
              </li>
              <li>
                <Link href="/industries/law-firm" className="hover:text-white transition-colors">
                  Law Firm
                </Link>
              </li>
            </ul>
          </div>

          {/* Free Tools Column */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Free Tools</h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/hook-generator" className="hover:text-white transition-colors">
                  AI Hook Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/ai-shorts-generator" className="hover:text-white transition-colors">
                  AI YouTube Video Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-tiktok-ad-generator" className="hover:text-white transition-colors">
                  AI Tik-Tok Video Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-facebook-ad-generator" className="hover:text-white transition-colors">
                  AI Facebook Video Ad Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-ads" className="hover:text-white transition-colors">
                  Facebook Ad Creative Testing
                </Link>
              </li>
              <li>
                <Link href="/industries/ecommerce" className="hover:text-white transition-colors">
                  Usecases
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <Link href="/" className="text-lg font-medium">
            blacktools<span className="text-neutral-500">.ai</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} blacktools.ai
          </p>
        </div>
      </div>
    </footer>
  )
}
