import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PricingCards } from '@/components/pricing/pricing-cards'
import { CloseButton } from '@/components/pricing/close-button'
import { UpgradeSuccessHandler } from '@/components/pricing/upgrade-success-handler'

export const metadata: Metadata = {
  title: 'Pricing - AI Video Generator Plans | blacktools.ai',
  description: 'Simple, transparent pricing for AI video generation. Access Sora 2, Veo 3.1, LipSync and 300+ AI avatars. Start with free trial. Plans from $24.50/month.',
  keywords: 'blacktools pricing, AI video generator pricing, AI UGC cost, AI avatar pricing',
  openGraph: {
    title: 'Pricing - AI Video Generator Plans',
    description: 'Simple, transparent pricing for AI video generation. Access Sora 2, Veo 3.1, LipSync and 300+ AI avatars.',
    url: 'https://blacktools.ai/pricing',
    siteName: 'blacktools.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - AI Video Generator Plans',
    description: 'Simple, transparent pricing for AI video generation. Start with free trial.',
  },
  alternates: {
    canonical: 'https://blacktools.ai/pricing',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function PricingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's current subscription info
  let currentPlan: string | null = null
  let currentCredits = 0
  let creditsExtras = 0
  let isTrialing = false
  let hasUsedTrial = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, credits, credits_extras, has_used_trial')
      .eq('id', user.id)
      .single()

    const profileData = profile as { subscription_plan: string | null; subscription_status: string; credits: number; credits_extras: number; has_used_trial: boolean } | null

    hasUsedTrial = profileData?.has_used_trial || false

    if (profileData?.subscription_status === 'active' || profileData?.subscription_status === 'trialing') {
      currentPlan = profileData.subscription_plan
      currentCredits = profileData.credits || 0
      creditsExtras = profileData.credits_extras || 0
      isTrialing = profileData.subscription_status === 'trialing'
    }
  }

  const hasActiveSubscription = !!currentPlan

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'blacktools.ai',
    description: 'AI video generation platform with UGC creation, 300+ avatars, Sora 2, Veo 3.1, and advanced lip-sync technology',
    brand: {
      '@type': 'Brand',
      name: 'blacktools.ai',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter Plan',
        description: '550 credits/month, 100+ avatars, 1080p export',
        price: '24.50',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://blacktools.ai/pricing',
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        description: '1,200 credits/month, 200+ avatars, 4K export, batch processing',
        price: '39.50',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://blacktools.ai/pricing',
      },
      {
        '@type': 'Offer',
        name: 'Premium Plan',
        description: '2,500 credits/month, 300+ avatars, 4K export, API access, custom avatars',
        price: '59.50',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://blacktools.ai/pricing',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a credit on blacktools.ai?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'One credit equals one AI generation. Different tools use different amounts of credits. For example, a 30-second video might use 5-10 credits depending on the model used.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I change plans anytime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, changes take effect at your next billing cycle.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do unused credits roll over?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Credits refresh each billing cycle and do not roll over. You can purchase additional credit packs anytime if needed.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a free trial?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Get 50 free credits when you sign up. No credit card required. Test all features before subscribing.',
        },
      },
      {
        '@type': 'Question',
        name: 'What payment methods do you accept?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through Stripe.',
        },
      },
    ],
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
        name: 'Pricing',
        item: 'https://blacktools.ai/pricing',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <UpgradeSuccessHandler />
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto relative">
        {/* Close button - only show for logged in users */}
        {user && <CloseButton />}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {isTrialing ? 'Your Trial Plan' : hasActiveSubscription ? 'Change Your Plan' : 'Choose Your Plan'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isTrialing
              ? 'You are currently on a trial. Plan changes will be available after your trial ends.'
              : hasActiveSubscription
              ? 'Upgrade or downgrade your plan at any time. Changes take effect immediately.'
              : 'Start creating amazing AI videos today. Choose your plan below.'}
          </p>
        </div>

        <PricingCards
          userId={user?.id}
          userEmail={user?.email}
          currentPlan={currentPlan}
          currentCredits={currentCredits}
          creditsExtras={creditsExtras}
          isTrialing={isTrialing}
          hasUsedTrial={hasUsedTrial}
        />

        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Cancel anytime. No questions asked.
          </p>
          
          {/* Skip button for new users without subscription */}
          {user && !hasActiveSubscription && (
            <div className="pt-4 border-t border-border/50">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Skip for now - Use my 50 free credits →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
