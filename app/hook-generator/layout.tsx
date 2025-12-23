import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Hook Generator - Create Viral TikTok & Reels Hooks',
  description: 'Generate attention-grabbing hooks for your TikTok and Instagram Reels in seconds. Free AI-powered tool, no signup required. Create viral content that stops the scroll.',
  keywords: ['hook generator', 'tiktok hooks', 'reels hooks', 'viral hooks', 'video hooks', 'content creator tools', 'free hook generator', 'ai copywriting'],
  openGraph: {
    title: 'Free Hook Generator - Create Viral Hooks for TikTok & Reels',
    description: 'Generate attention-grabbing hooks for your videos in seconds. Free, no signup required.',
    url: 'https://blacktools.ai/hook-generator',
  },
  alternates: {
    canonical: 'https://blacktools.ai/hook-generator',
  },
}

export default function HookGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
