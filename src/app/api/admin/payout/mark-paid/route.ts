import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type DatePreset = "all" | "today" | "this_week" | "this_month" | "this_year"

function getRange(preset: DatePreset) {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  if (preset === "all") {
    return { start: null, end: null }
  }

  if (preset === "today") {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  if (preset === "this_week") {
    const day = now.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day

    start.setDate(now.getDate() + diffToMonday)
    start.setHours(0, 0, 0, 0)

    end.setTime(start.getTime())
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    return { start, end }
  }

  if (preset === "this_month") {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    end.setMonth(now.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)

    return { start, end }
  }

  start.setMonth(0, 1)
  start.setHours(0, 0, 0, 0)

  end.setMonth(11, 31)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sellerProfileId = body?.sellerProfileId as string | undefined
    const datePreset = (body?.datePreset || "all") as DatePreset

    if (!sellerProfileId) {
      return NextResponse.json(
        { error: "sellerProfileId is required" },
        { status: 400 }
      )
    }

    const nowIso = new Date().toISOString()
    const range = getRange(datePreset)

    let query = supabase
      .from("orders")
      .update({
        payout_status: "paid",
        payout_at: nowIso,
      })
      .eq("seller_profile_id", sellerProfileId)
      .eq("payment_status", "paid")
      .neq("payout_status", "paid")
      .lte("eligible_payout_at", nowIso)

    if (range.start) {
      query = query.gte("paid_at", range.start.toISOString())
    }

    if (range.end) {
      query = query.lte("paid_at", range.end.toISOString())
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
