'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'
import { AlertTriangle } from 'lucide-react'
import { OAuthButtons } from './oauth-buttons'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [accountSuspended, setAccountSuspended] = useState(false)
  const [suspendedReason, setSuspendedReason] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for suspended account from OAuth redirect
  useEffect(() => {
    const suspended = searchParams.get('suspended')
    const reason = searchParams.get('reason')

    if (suspended === 'true') {
      setAccountSuspended(true)
      setSuspendedReason(reason)
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setAccountSuspended(false)
    setSuspendedReason(null)

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      // Check if account is suspended
      if (authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_status, account_suspended_reason')
          .eq('id', authData.user.id)
          .single()

        const profileData = profile as (Pick<Profile, 'account_status' | 'account_suspended_reason'> | null)
        if (profileData?.account_status === 'suspended') {
          // Sign out the user immediately
          await supabase.auth.signOut()
          setAccountSuspended(true)
          setSuspendedReason(profileData.account_suspended_reason)
          return
        }
      }

      toast.success('Logged in successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-medium tracking-tight mb-8">
          blacktools<span className="text-neutral-500">.ai</span>
        </Link>
        <h1 className="text-3xl font-medium tracking-tight mb-2">Welcome back</h1>
        <p className="text-neutral-500">Sign in to your account to continue</p>
      </div>

      {/* Suspended Alert */}
      {accountSuspended && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-400">Account Suspended</p>
              <p className="text-sm text-neutral-400 mt-1">
                {suspendedReason === 'chargeback'
                  ? 'Your account has been suspended due to a chargeback dispute. Please contact support for assistance.'
                  : suspendedReason === 'refund'
                  ? 'Your account has been suspended due to a refund request. Please contact support for assistance.'
                  : 'Your account has been suspended. Please contact support for assistance.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* OAuth */}
      <OAuthButtons />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#050505] px-4 text-neutral-500">Or continue with</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-white text-black font-medium hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-white hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
