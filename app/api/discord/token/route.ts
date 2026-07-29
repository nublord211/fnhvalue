import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json()

    if (!code || !redirectUri) {
      return NextResponse.json({ error: 'Missing code or redirectUri' }, { status: 400 })
    }

    const body = new URLSearchParams({
      client_id: '1530289183715889204',
      client_secret: 'XLC57DavMEaE3ssCMCM2YkvW01lvde7O',
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    })

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Discord token exchange failed', data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
