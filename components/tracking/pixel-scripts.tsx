'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface Pixel {
  type: 'facebook' | 'gtm'
  pixel_id: string
}

export function PixelScripts() {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const fetchPixels = async () => {
      try {
        const res = await fetch('/api/pixels')
        if (res.ok) {
          const data = await res.json()
          setPixels(data.pixels || [])
        }
      } catch (error) {
        console.error('Failed to fetch pixels:', error)
      } finally {
        setLoaded(true)
      }
    }

    fetchPixels()
  }, [])

  if (!loaded || pixels.length === 0) {
    return null
  }

  const facebookPixels = pixels.filter(p => p.type === 'facebook')
  const gtmPixels = pixels.filter(p => p.type === 'gtm')

  // Separate GTM containers from Google Ads/GA4 tags
  const gtmContainers = gtmPixels.filter(p => p.pixel_id.startsWith('GTM-'))
  const gtagIds = gtmPixels.filter(p => !p.pixel_id.startsWith('GTM-')) // AW-, G-, etc.

  return (
    <>
      {/* Facebook Pixel(s) */}
      {facebookPixels.length > 0 && (
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              ${facebookPixels.map(p => `fbq('init', '${p.pixel_id}');`).join('\n')}
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Facebook Pixel NoScript */}
      {facebookPixels.map(pixel => (
        <noscript key={`fb-noscript-${pixel.pixel_id}`}>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${pixel.pixel_id}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      ))}

      {/* Google Tag Manager (GTM-XXXXXXX) */}
      {gtmContainers.map(pixel => (
        <Script
          key={`gtm-${pixel.pixel_id}`}
          id={`gtm-${pixel.pixel_id}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${pixel.pixel_id}');
            `,
          }}
        />
      ))}

      {/* GTM NoScript */}
      {gtmContainers.map(pixel => (
        <noscript key={`gtm-noscript-${pixel.pixel_id}`}>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${pixel.pixel_id}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      ))}

      {/* Google Ads / GA4 (gtag.js) - AW-XXXXXXXXXX, G-XXXXXXXXXX */}
      {gtagIds.length > 0 && (
        <>
          <Script
            id="gtag-js"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagIds[0].pixel_id}`}
          />
          <Script
            id="gtag-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                ${gtagIds.map(p => `gtag('config', '${p.pixel_id}');`).join('\n')}
              `,
            }}
          />
        </>
      )}
    </>
  )
}

// Helper functions for Facebook Pixel events (client-side)
export function fbTrackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, params)
  }
}

export function fbTrackCustom(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, params)
  }
}

// Helper to get Facebook cookies
export function getFacebookCookies(): { fbc: string | null; fbp: string | null } {
  if (typeof document === 'undefined') {
    return { fbc: null, fbp: null }
  }

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return {
    fbc: cookies['_fbc'] || null,
    fbp: cookies['_fbp'] || null,
  }
}

// Helper for GTM dataLayer push
export function gtmPush(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push({
      event,
      ...data,
    })
  }
}
