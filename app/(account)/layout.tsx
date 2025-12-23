'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { UserProvider } from '@/contexts/user-context'
import { SubscriptionAlertModal } from '@/components/subscription/subscription-alert-modal'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <UserProvider>
      {/* Subscription Alert Modal - shows when canceled or payment failed */}
      <SubscriptionAlertModal />
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center gap-3 p-3 sm:p-4 border-b border-border bg-card/95 backdrop-blur-sm">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors touch-manipulation"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">
            blacktools<span className="text-muted-foreground">.ai</span>
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1">{children}</main>
      </div>
    </UserProvider>
  )
}
