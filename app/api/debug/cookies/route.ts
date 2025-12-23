import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Debug route to check Facebook cookies
export async function GET(request: NextRequest) {
  const cookies = request.cookies

  // Get all cookies
  const allCookies: Record<string, string> = {}
  cookies.getAll().forEach(cookie => {
    allCookies[cookie.name] = cookie.value
  })

  // Specifically look for Facebook cookies
  const fbc = cookies.get('_fbc')?.value || null
  const fbp = cookies.get('_fbp')?.value || null

  // Check URL for fbclid
  const url = new URL(request.url)
  const fbclid = url.searchParams.get('fbclid')

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    facebook: {
      fbc,
      fbp,
      fbclid_in_url: fbclid,
    },
    all_cookies: allCookies,
    cookie_count: Object.keys(allCookies).length,
  })
}
