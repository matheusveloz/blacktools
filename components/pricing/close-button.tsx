'use client'

import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export function CloseButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/dashboard')}
      className="absolute top-0 right-0 p-2 rounded-full border border-border text-muted-foreground hover:text-white hover:border-white transition-all cursor-pointer"
      aria-label="Close"
    >
      <X className="w-5 h-5" />
    </button>
  )
}
