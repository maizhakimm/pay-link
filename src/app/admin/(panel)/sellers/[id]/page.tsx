import { createClient } from "@supabase/supabase-js"
import SellerEditClient from "./seller-edit-client"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Page({
  params,
}: {
  params: { id: string }
}) {
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !data) {
    return <div className="p-6">Seller not found</div>
  }

  return <SellerEditClient seller={data} />
}
