'use client'

import { useState } from 'react'
import { ExternalLink, DollarSign, Users, TrendingUp, Gift, Check, Copy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function AffiliatesPage() {
  const [copied, setCopied] = useState(false)
  const affiliateLink = 'https://blacktools-ai.getrewardful.com/signup'

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: '15% Lifetime Commission',
      description: 'Earn 15% of every payment your referrals make, for as long as they stay subscribed.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Recurring Revenue',
      description: 'Monthly recurring income from subscriptions. The more you refer, the more you earn.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'No Limits',
      description: 'Refer unlimited users. There\'s no cap on how much you can earn.',
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: 'Easy Payouts',
      description: 'Get paid via PayPal or bank transfer. Minimum payout of just $50.',
    },
  ]

  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your free affiliate account in seconds.',
    },
    {
      number: '2',
      title: 'Share Your Link',
      description: 'Get your unique referral link and share it with your audience.',
    },
    {
      number: '3',
      title: 'Earn Commission',
      description: 'Earn 15% for every subscription your referrals make.',
    },
  ]

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Affiliate Program
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our affiliate program and earn <span className="text-primary font-semibold">15% lifetime commission</span> on every subscription you refer.
          </p>
        </div>

        {/* Commission Highlight */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="text-5xl sm:text-6xl font-bold text-primary mb-2">15%</div>
                <div className="text-lg font-medium">Lifetime Commission</div>
                <p className="text-sm text-muted-foreground mt-1">
                  For as long as your referral stays subscribed
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2"
                  onClick={() => window.open(affiliateLink, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Become an Affiliate
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto gap-2"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Signup Link'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why Join Our Program?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Example Earnings */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Potential Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Referrals</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avg. Plan</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Monthly Earnings</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Yearly Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">10 users</td>
                    <td className="py-3 px-4">$39.50</td>
                    <td className="py-3 px-4 text-right text-primary font-medium">$59.25</td>
                    <td className="py-3 px-4 text-right text-primary font-medium">$711.00</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">50 users</td>
                    <td className="py-3 px-4">$39.50</td>
                    <td className="py-3 px-4 text-right text-primary font-medium">$296.25</td>
                    <td className="py-3 px-4 text-right text-primary font-medium">$3,555.00</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">100 users</td>
                    <td className="py-3 px-4">$39.50</td>
                    <td className="py-3 px-4 text-right text-primary font-medium">$592.50</td>
                    <td className="py-3 px-4 text-right text-primary font-medium">$7,110.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              * Based on 15% commission on Pro plan ($39.50/month). Actual earnings depend on referred plan and retention.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="gap-2 px-8"
            onClick={() => window.open(affiliateLink, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Join the Affiliate Program
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Free to join. No minimum requirements.
          </p>
        </div>
      </div>
    </div>
  )
}
