import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminFromRequest } from "../../../../../lib/admin-auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdminFromRequest(req)
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const body = await req.json()

    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: "Missing seller id" },
        { status: 400 }
      )
    }

    const allowedFields = new Set([
      "store_name",
      "shop_slug",
      "email",
      "whatsapp",
      "company_name",
      "company_registration",
      "business_address",
      "bank_name",
      "account_name",
      "account_number",
      "closed_message",
      "temporarily_closed",
      "plan_type",
      "profile_image",
      "delivery_mode",
      "delivery_fee",
      "delivery_area",
      "delivery_note",
      "delivery_radius_km",
      "delivery_rate_per_km",
      "delivery_min_fee",
      "pickup_address",
      "latitude",
      "longitude",
      "minimum_order_enabled",
      "minimum_order_type",
      "minimum_order_value",
      "minimum_order_message",
    ])

    const safeUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => allowedFields.has(key))
    )

    if (Object.keys(safeUpdateData).length === 0) {
      return NextResponse.json(
        { error: "No allowed fields to update" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("seller_profiles")
      .update(safeUpdateData)
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
