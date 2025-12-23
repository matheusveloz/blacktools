import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const FB_API_VERSION = 'v23.0'
const FB_API_BASE = `https://graph.facebook.com/${FB_API_VERSION}`

interface FacebookPixelConfig {
  pixel_id: string
  access_token: string
}

interface UserData {
  email?: string
  externalId?: string
  clientIpAddress?: string
  clientUserAgent?: string
  fbc?: string // Facebook Click ID (from _fbc cookie) - persists 90 days
  fbp?: string // Facebook Browser ID (from _fbp cookie) - persists 90 days
}

interface CustomData {
  currency?: string
  value?: number
  contentName?: string
  contentCategory?: string
  contentIds?: string[]
  contentType?: string
  numItems?: number
  orderId?: string
  searchString?: string
  status?: string
  predictedLtv?: number
  deliveryCategory?: string
}

interface EventData {
  eventName: string
  eventTime?: number
  eventId?: string
  eventSourceUrl?: string
  actionSource?: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other'
  userData: UserData
  customData?: CustomData
  optOut?: boolean
  dataProcessingOptions?: string[]
  dataProcessingOptionsCountry?: number
  dataProcessingOptionsState?: number
}

// Hash user data using SHA256 as required by Facebook
function hashUserData(value: string | undefined): string | undefined {
  if (!value) return undefined
  const normalized = value.toLowerCase().trim()
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

// Format user data for Facebook CAPI
function formatUserData(userData: UserData): Record<string, unknown> {
  return {
    em: userData.email ? [hashUserData(userData.email)] : undefined,
    external_id: userData.externalId ? [hashUserData(userData.externalId)] : undefined,
    client_ip_address: userData.clientIpAddress,
    client_user_agent: userData.clientUserAgent,
    fbc: userData.fbc, // Critical for attribution - links to ad click
    fbp: userData.fbp, // Critical for attribution - identifies browser
  }
}

// Format custom data for Facebook CAPI
function formatCustomData(customData?: CustomData): Record<string, unknown> | undefined {
  if (!customData) return undefined

  return {
    currency: customData.currency,
    value: customData.value,
    content_name: customData.contentName,
    content_category: customData.contentCategory,
    content_ids: customData.contentIds,
    content_type: customData.contentType,
    num_items: customData.numItems,
    order_id: customData.orderId,
    search_string: customData.searchString,
    status: customData.status,
    predicted_ltv: customData.predictedLtv,
    delivery_category: customData.deliveryCategory,
  }
}

// Get active Facebook pixels from database
export async function getActiveFacebookPixels(): Promise<FacebookPixelConfig[]> {
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('pixels')
      .select('pixel_id, access_token')
      .eq('type', 'facebook')
      .eq('is_active', true)

    if (error || !data) {
      console.error('Error fetching Facebook pixels:', error)
      return []
    }

    return data.filter(p => p.pixel_id && p.access_token) as FacebookPixelConfig[]
  } catch (error) {
    console.error('Error in getActiveFacebookPixels:', error)
    return []
  }
}

// Send event to a single Facebook pixel
async function sendEventToPixel(
  pixel: FacebookPixelConfig,
  eventData: EventData
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${FB_API_BASE}/${pixel.pixel_id}/events`

    const formattedEvent = {
      event_name: eventData.eventName,
      event_time: eventData.eventTime || Math.floor(Date.now() / 1000),
      event_id: eventData.eventId || crypto.randomUUID(),
      event_source_url: eventData.eventSourceUrl,
      action_source: eventData.actionSource || 'website',
      user_data: formatUserData(eventData.userData),
      custom_data: formatCustomData(eventData.customData),
      opt_out: eventData.optOut,
      data_processing_options: eventData.dataProcessingOptions,
      data_processing_options_country: eventData.dataProcessingOptionsCountry,
      data_processing_options_state: eventData.dataProcessingOptionsState,
    }

    // Remove undefined values
    Object.keys(formattedEvent).forEach(key => {
      if (formattedEvent[key as keyof typeof formattedEvent] === undefined) {
        delete formattedEvent[key as keyof typeof formattedEvent]
      }
    })

    if (formattedEvent.user_data) {
      Object.keys(formattedEvent.user_data).forEach(key => {
        if (formattedEvent.user_data![key as keyof typeof formattedEvent.user_data] === undefined) {
          delete formattedEvent.user_data![key as keyof typeof formattedEvent.user_data]
        }
      })
    }

    if (formattedEvent.custom_data) {
      Object.keys(formattedEvent.custom_data).forEach(key => {
        if (formattedEvent.custom_data![key as keyof typeof formattedEvent.custom_data] === undefined) {
          delete formattedEvent.custom_data![key as keyof typeof formattedEvent.custom_data]
        }
      })
    }

    const payload = {
      data: [formattedEvent],
      access_token: pixel.access_token,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Facebook CAPI error:', result)
      return { success: false, error: result.error?.message || 'Unknown error' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending event to Facebook:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send event to all active Facebook pixels
export async function sendFacebookEvent(eventData: EventData): Promise<void> {
  const pixels = await getActiveFacebookPixels()

  if (pixels.length === 0) {
    return
  }

  // Send to all pixels in parallel
  await Promise.all(
    pixels.map(pixel => sendEventToPixel(pixel, eventData))
  )
}

// Standard Facebook Events
export async function trackPurchase(params: {
  userData: UserData
  value: number
  currency: string
  orderId?: string
  contentIds?: string[]
  numItems?: number
  eventSourceUrl?: string
}): Promise<void> {
  await sendFacebookEvent({
    eventName: 'Purchase',
    userData: params.userData,
    eventSourceUrl: params.eventSourceUrl,
    customData: {
      value: params.value,
      currency: params.currency,
      orderId: params.orderId,
      contentIds: params.contentIds,
      numItems: params.numItems,
    },
  })
}

export async function trackInitiateCheckout(params: {
  userData: UserData
  value?: number
  currency?: string
  contentIds?: string[]
  numItems?: number
  eventSourceUrl?: string
}): Promise<void> {
  await sendFacebookEvent({
    eventName: 'InitiateCheckout',
    userData: params.userData,
    eventSourceUrl: params.eventSourceUrl,
    customData: {
      value: params.value,
      currency: params.currency,
      contentIds: params.contentIds,
      numItems: params.numItems,
    },
  })
}

export async function trackCompleteRegistration(params: {
  userData: UserData
  status?: string
  eventSourceUrl?: string
}): Promise<void> {
  await sendFacebookEvent({
    eventName: 'CompleteRegistration',
    userData: params.userData,
    eventSourceUrl: params.eventSourceUrl,
    customData: {
      status: params.status || 'completed',
    },
  })
}

export async function trackSubscribe(params: {
  userData: UserData
  value?: number
  currency?: string
  predictedLtv?: number
  eventSourceUrl?: string
}): Promise<void> {
  await sendFacebookEvent({
    eventName: 'Subscribe',
    userData: params.userData,
    eventSourceUrl: params.eventSourceUrl,
    customData: {
      value: params.value,
      currency: params.currency,
      predictedLtv: params.predictedLtv,
    },
  })
}

export async function trackPageView(params: {
  userData: UserData
  eventSourceUrl?: string
}): Promise<void> {
  await sendFacebookEvent({
    eventName: 'PageView',
    userData: params.userData,
    eventSourceUrl: params.eventSourceUrl,
  })
}

export async function trackViewContent(params: {
  userData: UserData
  contentName?: string
  contentCategory?: string
  contentIds?: string[]
  value?: number
  currency?: string
  eventSourceUrl?: string
}): Promise<void> {
  await sendFacebookEvent({
    eventName: 'ViewContent',
    userData: params.userData,
    eventSourceUrl: params.eventSourceUrl,
    customData: {
      contentName: params.contentName,
      contentCategory: params.contentCategory,
      contentIds: params.contentIds,
      value: params.value,
      currency: params.currency,
    },
  })
}

export async function trackLead(params: {
  userData: UserData
  value?: number
  currency?: string
  contentName?: string
  eventSourceUrl?: string
}): Promise<void> {
  await sendFacebookEvent({
    eventName: 'Lead',
    userData: params.userData,
    eventSourceUrl: params.eventSourceUrl,
    customData: {
      value: params.value,
      currency: params.currency,
      contentName: params.contentName,
    },
  })
}
