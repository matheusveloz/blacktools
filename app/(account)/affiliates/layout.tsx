import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Program - Earn 15% Lifetime Commission | Blacktools AI',
  description: 'Join the Blacktools AI affiliate program and earn 15% lifetime commission on every referral. No limits, recurring revenue, easy payouts via PayPal. Start earning today!',
  keywords: [
    'ai video generator affiliate program',
    'blacktools affiliate',
    'ai affiliate program',
    'earn money with ai',
    'video generator affiliate',
    'recurring commission program',
    'lifetime commission affiliate',
    'sora affiliate program',
    'veo 3 affiliate',
    'ai video affiliate marketing',
    'passive income ai',
    'refer and earn ai',
  ],
  openGraph: {
    type: 'website',
    title: 'Affiliate Program - Earn 15% Lifetime Commission | Blacktools AI',
    description: 'Join our affiliate program and earn 15% lifetime commission on every subscription you refer. No limits, recurring revenue, easy payouts.',
    url: 'https://blacktools.ai/affiliates',
    siteName: 'Blacktools AI',
    images: [
      {
        url: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/banner.webp',
        width: 1200,
        height: 630,
        alt: 'Blacktools AI Affiliate Program - 15% Lifetime Commission',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affiliate Program - 15% Lifetime Commission | Blacktools AI',
    description: 'Earn 15% lifetime commission on every referral. Join the Blacktools AI affiliate program today!',
    images: ['https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/images/site/banner.webp'],
  },
  alternates: {
    canonical: 'https://blacktools.ai/affiliates',
  },
}

export default function AffiliatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
