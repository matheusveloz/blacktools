'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 border-t border-white/5 relative">
      {/* Subtle glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight">
          Start creating
          <br />
          <span className="text-neutral-500">today.</span>
        </h2>

        <p className="mt-6 text-neutral-500 text-lg">
          50 free credits. No credit card required.
        </p>

        <div className="mt-10">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-full font-medium text-lg hover:bg-white/20 hover:border-white/20 transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
