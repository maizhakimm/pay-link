import { NextRequest, NextResponse } from 'next/server'

type GoogleGeocodeResult = {
  geometry?: {
    location?: {
      lat?: number
      lng?: number
    }
  }
  formatted_address?: string
}

type GoogleGeocodeResponse = {
  status?: string
  results?: GoogleGeocodeResult[]
  error_message?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const address = String(body?.address || '').trim()

    if (!address) {
      return NextResponse.json(
        { ok: false, error: 'Address is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'Missing GOOGLE_MAPS_API_KEY' },
        { status: 500 }
      )
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.set('address', address)
    url.searchParams.set('key', apiKey)
    url.searchParams.set('region', 'my')

    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    })

    const data = (await response.json()) as GoogleGeocodeResponse

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: 'Failed to reach Google Geocoding API' },
        { status: 502 }
      )
    }

    if (data.status !== 'OK' || !data.results?.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            data.error_message ||
            'Alamat tidak dapat dikenal pasti. Sila semak semula alamat pickup.',
          google_status: data.status || 'UNKNOWN',
        },
        { status: 400 }
      )
    }

    const first = data.results[0]
    const lat = Number(first.geometry?.location?.lat)
    const lng = Number(first.geometry?.location?.lng)
    const formattedAddress = first.formatted_address || address

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { ok: false, error: 'Latitude/longitude not found from geocoding result' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      latitude: lat,
      longitude: lng,
      formatted_address: formattedAddress,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to geocode address'

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
