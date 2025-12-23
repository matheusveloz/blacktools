'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Copy, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const MAX_GENERATIONS = 25
const MAX_CHARS = 500

export default function HookGeneratorPage() {
  const [description, setDescription] = useState('')
  const [hooks, setHooks] = useState<{ text: string; trigger: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [generationsLeft, setGenerationsLeft] = useState(MAX_GENERATIONS)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('hook_generations_left')
    if (stored) {
      setGenerationsLeft(parseInt(stored, 10))
    }
  }, [])

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please describe your product or service')
      return
    }

    if (generationsLeft <= 0) {
      toast.error('You have reached the generation limit')
      return
    }

    setIsLoading(true)
    setHooks([])

    try {
      const response = await fetch('/api/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate hooks')
      }

      const data = await response.json()
      setHooks(data.hooks)

      const newCount = generationsLeft - 1
      setGenerationsLeft(newCount)
      localStorage.setItem('hook_generations_left', newCount.toString())

      toast.success('Hooks generated!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate hooks')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link href="/" className="text-lg font-medium tracking-tight">
            blacktools<span className="text-neutral-500">.ai</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">
              Hook Generator
            </h1>
            <span className="px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full">
              Free
            </span>
          </div>
          <p className="text-neutral-500 text-lg mb-12">
            Generate viral hooks for your Reels and TikToks. Powered by AI.
          </p>

          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-300">
                Describe your product or service
              </label>
              <span className="text-xs text-neutral-600">
                {description.length}/{MAX_CHARS}
              </span>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Describe your product or service in detail (e.g., features, benefits, target audience)..."
              className="w-full h-40 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">
                {generationsLeft} generations left
              </span>

              <button
                onClick={handleGenerate}
                disabled={isLoading || generationsLeft <= 0 || !description.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Hooks
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {hooks.length > 0 && (
            <div className="mt-12 space-y-4">
              <h2 className="text-xl font-medium mb-6">Your Hooks</h2>

              {hooks.map((hook, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-neutral-600">
                          Hook {index + 1}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                          {hook.trigger}
                        </span>
                      </div>
                      <p className="text-white leading-relaxed">{hook.text}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(hook.text, index)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 mt-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">
            blacktools<span className="text-neutral-600">.ai</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
