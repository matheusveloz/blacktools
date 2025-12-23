'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          <Link href="/" className="text-base sm:text-lg font-medium tracking-tight">
            blacktools<span className="text-neutral-500">.ai</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/login"
              className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
