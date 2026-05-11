import { NextRequest, NextResponse } from 'next/server'

type GoogleDistanceMatrixResponse = {
  status?: string
  rows?: {
    elements?: {
      status?: string
      distance?: {
        value?: number
        text?: string
      }
      duration?: {
        value?: number
        text?: string
      }
    }[]
  }[]
  error_message?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const originLat = Number(body?.originLat)
    const originLng = Number(body?.originLng)

    const destinationLat = Number(body?.destinationLat)
    const destinationLng = Number(body?.destinationLng)

    if (
      !Number.isFinite(originLat) ||
      !Number.isFinite(originLng) ||
      !Number.isFinite(destinationLat) ||
      !Number.isFinite(destinationLng)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid coordinates',
        },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing GOOGLE_MAPS_API_KEY',
        },
        { status: 500 }
      )
    }

    const url = new URL(
      'https://maps.googleapis.com/maps/api/distancematrix/json'
    )

    url.searchParams.set(
      'origins',
      `${originLat},${originLng}`
    )

    url.searchParams.set(
      'destinations',
      `${destinationLat},${destinationLng}`
    )

    url.searchParams.set('mode', 'driving')
    url.searchParams.set('units', 'metric')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    })

    const data =
      (await response.json()) as GoogleDistanceMatrixResponse

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to reach Google Distance Matrix API',
        },
        { status: 502 }
      )
    }

    if (data.status !== 'OK') {
      return NextResponse.json(
        {
          ok: false,
          error:
            data.error_message ||
            'Distance Matrix API failed',
        },
        { status: 400 }
      )
    }

    const element = data.rows?.[0]?.elements?.[0]

    if (!element || element.status !== 'OK') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Distance calculation unavailable',
        },
        { status: 400 }
      )
    }

    const distanceMeters = Number(
      element.distance?.value || 0
    )

    const distanceKm = distanceMeters / 1000

    return NextResponse.json({
      ok: true,
      distance_km: distanceKm,
      distance_text: element.distance?.text || '',
      duration_text: element.duration?.text || '',
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Distance calculation failed'

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
