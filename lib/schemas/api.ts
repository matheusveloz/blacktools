/**
 * Zod schemas for API route validation
 * Provides type-safe input validation for all API endpoints
 */

import { z } from 'zod'

// Sora2 Generate Schema
export const sora2GenerateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  size: z.enum(['1280x720', '720x1280']).optional(), // landscape | portrait
  seconds: z.enum(['10', '15']).optional(),
  imageUrl: z.string().url().optional(),
  skipCreditDeduction: z.boolean().optional(),
})

// Veo3 Generate Schema
// Note: Veo3 uses aspectRatio/speed in model name, not size/seconds
export const veo3GenerateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  size: z.enum(['1280x720', '720x1280']).optional(), // mapped to aspectRatio internally
  seconds: z.enum(['10', '15']).optional(), // mapped to speed internally
  imageUrl: z.string().url().optional(),
  skipCreditDeduction: z.boolean().optional(),
})

// NanoBanana Generate Schema
export const nanobananaGenerateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21', '2:1', '1:2', '3:2', '2:3']).optional(),
  resolution: z.enum(['1K', '2K', '4K']).optional(),
  referenceImages: z.array(z.string()).max(14).optional(),
  skipCreditDeduction: z.boolean().optional(),
})

// InfiniteTalk Generate Schema
export const infinitetalkGenerateSchema = z.object({
  imageUrl: z.string().url(),
  audioUrl: z.string().url(),
  resolution: z.enum(['480p', '720p']).optional(),
  prompt: z.string().max(500).optional(),
  seed: z.number().int().min(-1).optional(),
  skipCreditDeduction: z.boolean().optional(),
})

// LipSync Generate Schema
export const lipsyncGenerateSchema = z.object({
  srcVideoUrl: z.string().url(),
  audioUrl: z.string().url(),
  videoParams: z.object({
    video_width: z.number().int().min(0).optional(),
    video_height: z.number().int().min(0).optional(),
    video_enhance: z.number().int().min(0).max(1).optional(),
  }).optional(),
  skipCreditDeduction: z.boolean().optional(),
})

// Credits Purchase Schema
export const creditsPurchaseSchema = z.object({
  packId: z.string().min(1),
  email: z.string().email().optional(),
  customCredits: z.number().int().min(100).max(100000).optional(),
  pricePerCredit: z.number().positive().max(1).optional(),
  isPopular: z.boolean().optional(),
})

// Credits Deduct Schema
export const creditsDeductSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().max(500).optional(),
})

// Stripe Subscribe Schema
export const stripeSubscribeSchema = z.object({
  planKey: z.string().min(1),
  email: z.string().email().optional(),
  referral: z.string().uuid().optional(), // Rewardful referral ID
})

// Stripe Change Plan Schema
export const stripeChangePlanSchema = z.object({
  newPlanKey: z.string().min(1).optional(),
  planKey: z.string().min(1).optional(),
}).refine(data => data.newPlanKey || data.planKey, {
  message: 'Either newPlanKey or planKey must be provided',
})

// Stripe Create Checkout Schema
export const stripeCreateCheckoutSchema = z.object({
  planKey: z.string().min(1),
  email: z.string().email().optional(),
  referral: z.string().uuid().optional(), // Rewardful referral ID
})

// Upload Schema (form data - validated separately)
export const uploadSchema = z.object({
  type: z.enum(['video', 'audio', 'image']),
})

// Metadata Schemas for Generation Records
// These validate metadata before saving to database

// Sora2 Metadata Schema
export const sora2MetadataSchema = z.object({
  prompt: z.string().min(1).max(2000),
  size: z.enum(['1280x720', '720x1280']).optional(),
  seconds: z.enum(['10', '15']).optional(),
  imageUrl: z.string().url().optional().nullable(),
  task_id: z.string().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  failed_at: z.string().datetime().optional(),
  error: z.string().max(1000).optional(),
  original_url: z.string().url().optional(),
  storage_error: z.string().max(500).optional(),
})

// Veo3 Metadata Schema
export const veo3MetadataSchema = z.object({
  prompt: z.string().min(1).max(2000),
  model: z.string().min(1).max(100).optional(),
  aspectRatio: z.enum(['portrait', 'landscape']).optional(),
  speed: z.enum(['standard', 'fast']).optional(),
  imageUrl: z.string().url().optional().nullable(),
  task_id: z.string().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  failed_at: z.string().datetime().optional(),
  error: z.string().max(1000).optional(),
  duration: z.number().positive().optional(),
  resolution: z.string().max(50).optional(),
  original_url: z.string().url().optional(),
  storage_error: z.string().max(500).optional(),
})

// NanoBanana Metadata Schema
export const nanobananaMetadataSchema = z.object({
  prompt: z.string().min(1).max(2000),
  model: z.string().max(100).optional(),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21', '2:1', '1:2', '3:2', '2:3']).optional(),
  resolution: z.enum(['1K', '2K', '4K']).optional(),
  referenceImages: z.array(z.string().url()).max(14).optional(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  failed_at: z.string().datetime().optional(),
  error: z.string().max(1000).optional(),
})

// InfiniteTalk Metadata Schema
export const infinitetalkMetadataSchema = z.object({
  imageUrl: z.string().url(),
  audioUrl: z.string().url(),
  audioDurationSeconds: z.number().positive(),
  params: z.object({
    resolution: z.enum(['480p', '720p']).optional(),
    prompt: z.string().max(500).optional(),
    seed: z.number().int().min(-1).optional(),
  }).optional(),
  prediction_id: z.string().optional(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  failed_at: z.string().datetime().optional(),
  error: z.string().max(1000).optional(),
  original_url: z.string().url().optional(),
  storage_error: z.string().max(500).optional(),
})

// LipSync Metadata Schema
export const lipsyncMetadataSchema = z.object({
  srcVideoUrl: z.string().url(),
  audioUrl: z.string().url(),
  audioDurationSeconds: z.number().positive(),
  videoParams: z.object({
    video_width: z.number().int().min(0),
    video_height: z.number().int().min(0),
    video_enhance: z.number().int().min(0).max(1),
    fps: z.enum(['original']).optional(),
  }).optional(),
  task_id: z.string().optional(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  failed_at: z.string().datetime().optional(),
  error: z.string().max(1000).optional(),
  original_url: z.string().url().optional(),
  storage_error: z.string().max(500).optional(),
})

// Type exports for use in routes
export type Sora2GenerateInput = z.infer<typeof sora2GenerateSchema>
export type Veo3GenerateInput = z.infer<typeof veo3GenerateSchema>
export type NanoBananaGenerateInput = z.infer<typeof nanobananaGenerateSchema>
export type InfiniteTalkGenerateInput = z.infer<typeof infinitetalkGenerateSchema>
export type LipSyncGenerateInput = z.infer<typeof lipsyncGenerateSchema>
export type CreditsPurchaseInput = z.infer<typeof creditsPurchaseSchema>
export type CreditsDeductInput = z.infer<typeof creditsDeductSchema>
export type StripeSubscribeInput = z.infer<typeof stripeSubscribeSchema>
export type StripeChangePlanInput = z.infer<typeof stripeChangePlanSchema>
export type StripeCreateCheckoutInput = z.infer<typeof stripeCreateCheckoutSchema>
