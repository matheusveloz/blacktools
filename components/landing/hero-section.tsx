'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="pt-28 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Green spray effect - top left */}
      <div
        className="absolute -top-20 -left-20 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 60% 40%, rgba(34, 197, 94, 0.1) 0%, transparent 30%),
            radial-gradient(circle at 40% 60%, rgba(34, 197, 94, 0.08) 0%, transparent 35%)
          `,
          filter: 'blur(40px)',
        }}
      />

      {/* Green spray effect - top right */}
      <div
        className="absolute -top-10 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(34, 197, 94, 0.12) 0%, transparent 35%),
            radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.06) 0%, transparent 40%)
          `,
          filter: 'blur(50px)',
        }}
      />

      {/* Green spray effect - center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(34, 197, 94, 0.08) 0%, transparent 50%)
          `,
          filter: 'blur(60px)',
        }}
      />

      {/* 3D Perspective Grid - on top of spray */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(400px) rotateX(55deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight leading-[0.95]">
          Video generation
          <br />
          <span className="text-neutral-500">made simple.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-lg sm:text-xl text-neutral-400 max-w-xl leading-relaxed">
          Create professional videos with Sora 2, Veo 3.1, LipSync and more.
          No watermarks. No complexity.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-full font-medium hover:bg-white/20 hover:border-white/20 transition-all"
          >
            Get 50 Free Credits
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>50 free credits</span>
            <span className="w-1 h-1 rounded-full bg-neutral-700" />
            <span>No credit card required</span>
          </div>
        </div>

        {/* Key differentiator */}
        <div className="mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-white/5">
          <p className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight">
            Run <span className="text-white">multiple generations</span> at once.
            <br />
            <span className="text-neutral-500">Bulk processing. All tools. Simultaneously.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
