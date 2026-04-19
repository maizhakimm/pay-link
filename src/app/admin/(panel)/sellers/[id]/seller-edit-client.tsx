"use client"

import { useState } from "react"

export default function SellerEditClient({ seller }: { seller: any }) {
  const [form, setForm] = useState(seller)
  const [loading, setLoading] = useState(false)

  function handleChange(key: string, value: any) {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  async function handleSave() {
    try {
      setLoading(true)

      const res = await fetch("/api/admin/sellers/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error)
      }

      alert("Saved successfully")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Seller</h1>

      {/* PROFILE */}
      <div className="bg-white p-4 rounded-xl border space-y-3">
        <h2 className="font-semibold">Profile</h2>

        <input
          value={form.store_name || ""}
          onChange={(e) => handleChange("store_name", e.target.value)}
          placeholder="Store Name"
          className="input"
        />

        <input
          value={form.contact_phone || ""}
          onChange={(e) => handleChange("contact_phone", e.target.value)}
          placeholder="Phone"
          className="input"
        />

        <input
          value={form.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Email"
          className="input"
        />
      </div>

      {/* BANK */}
      <div className="bg-white p-4 rounded-xl border space-y-3">
        <h2 className="font-semibold">Bank Info</h2>

        <input
          value={form.bank_name || ""}
          onChange={(e) => handleChange("bank_name", e.target.value)}
          placeholder="Bank Name"
          className="input"
        />

        <input
          value={form.account_number || ""}
          onChange={(e) => handleChange("account_number", e.target.value)}
          placeholder="Account Number"
          className="input"
        />

        <input
          value={form.account_holder_name || ""}
          onChange={(e) =>
            handleChange("account_holder_name", e.target.value)
          }
          placeholder="Account Holder"
          className="input"
        />
      </div>

      {/* DELIVERY */}
      <div className="bg-white p-4 rounded-xl border space-y-3">
        <h2 className="font-semibold">Delivery</h2>

        <input
          value={form.delivery_radius_km || ""}
          onChange={(e) =>
            handleChange("delivery_radius_km", e.target.value)
          }
          placeholder="Radius KM"
          className="input"
        />

        <input
          value={form.delivery_rate_per_km || ""}
          onChange={(e) =>
            handleChange("delivery_rate_per_km", e.target.value)
          }
          placeholder="Rate per KM"
          className="input"
        />

        <input
          value={form.delivery_min_fee || ""}
          onChange={(e) =>
            handleChange("delivery_min_fee", e.target.value)
          }
          placeholder="Minimum Fee"
          className="input"
        />
      </div>

      {/* SETTINGS */}
      <div className="bg-white p-4 rounded-xl border space-y-3">
        <h2 className="font-semibold">Settings</h2>

        <label>
          <input
            type="checkbox"
            checked={form.accept_orders_anytime}
            onChange={(e) =>
              handleChange("accept_orders_anytime", e.target.checked)
            }
          />
          Accept Orders Anytime
        </label>

        <input
          value={form.opening_time || ""}
          onChange={(e) => handleChange("opening_time", e.target.value)}
          placeholder="Opening Time"
          className="input"
        />

        <input
          value={form.closing_time || ""}
          onChange={(e) => handleChange("closing_time", e.target.value)}
          placeholder="Closing Time"
          className="input"
        />
      </div>

      {/* SAVE */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded-xl"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}
