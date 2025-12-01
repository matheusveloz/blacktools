import { createClient } from '@/lib/supabase/server'
import { PricingCards } from '@/components/pricing/pricing-cards'

export default async function PricingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start creating amazing AI videos today. All plans include a 1-day free trial.
          </p>
        </div>

        <PricingCards userId={user?.id} userEmail={user?.email} />

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  )
}
