'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Video, Mic, User, Sparkles, Zap, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: <Video className="h-6 w-6" />,
    title: 'Sora 2 & Veo 3',
    description: 'Generate stunning videos from text prompts using the latest AI models',
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: 'LipSync',
    description: 'Sync any audio to video with realistic AI lip movements',
  },
  {
    icon: <User className="h-6 w-6" />,
    title: 'Avatar Generation',
    description: 'Create unique AI avatars from text descriptions',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Workflow Editor',
    description: 'Visual node-based editor for complex video pipelines',
  },
]

const benefits = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Fast Generation',
    description: 'Get results in minutes, not hours',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Secure & Private',
    description: 'Your data is encrypted and secure',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: '1-Day Free Trial',
    description: 'Try all features risk-free',
  },
]

export function Hero() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <span className="text-lg sm:text-xl font-semibold">blacktools<span className="text-muted-foreground">.ai</span></span>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="text-xs sm:text-sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              AI-Powered Video Generation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6"
          >
            Create Stunning Videos
            <br />
            <span className="text-primary">with AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-2"
          >
            Harness the power of Sora 2, Veo 3, LipSync, and Avatar generation.
            Build complex video workflows with our visual node editor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 sm:py-12 border-t border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  {benefit.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Powerful AI Tools
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              Everything you need to create professional videos with artificial intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-card border rounded-xl p-4 sm:p-5 md:p-6 hover:border-primary transition-colors"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-2">
            Join thousands of creators using blacktools.ai to generate amazing AI videos.
            Start your 1-day free trial today.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <span className="font-semibold text-sm sm:text-base">blacktools<span className="text-muted-foreground">.ai</span></span>
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
            &copy; {new Date().getFullYear()} blacktools.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
