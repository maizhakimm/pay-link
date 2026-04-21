'use client'

import Layout from '../../../components/Layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type SellerProfileRow = {
  id: string
  user_id: string
  store_name?: string | null
  enable_delivery_slots?: boolean | null
}

type DeliverySlotRow = {
  id: string
  seller_profile_id: string
  label: string
  start_time: string
  end_time: string
  is_active: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

function formatTime12(value?: string | null) {
  if (!value || !value.includes(':')) return value || ''

  const [hourString, minuteString] = value.split(':')
  const hour = Number(hourString)
  const minute = Number(minuteString || '0')

  if (Number.isNaN(hour) || Number.isNaN(minute)) return value || ''

  const period = hour >= 12 ? 'PM' : 'AM'
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12
  const normalizedMinute = minute.toString().padStart(2, '0')

  return `${normalizedHour}:${normalizedMinute} ${period}`
}

function buildSlotLabel(startTime: string, endTime: string) {
  return `${formatTime12(startTime)} - ${formatTime12(endTime)}`
}

function toMinutes(value?: string | null) {
  if (!value || !value.includes(':')) return null

  const [hourString, minuteString] = value.split(':')
  const hour = Number(hourString)
  const minute = Number(minuteString)

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null

  return hour * 60 + minute
}

export default function DeliverySlotsPage() {
  const [loading, setLoading] = useState(true)
  const [savingToggle, setSavingToggle] = useState(false)
  const [savingSlot, setSavingSlot] = useState(false)
  const [pageError, setPageError] = useState('')

  const [seller, setSeller] = useState<SellerProfileRow | null>(null)
  const [slots, setSlots] = useState<DeliverySlotRow[]>([])

  const [enableDeliverySlots, setEnableDeliverySlots] = useState(false)

  const [editingSlotId, setEditingSlotId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState('18:30')
  const [endTime, setEndTime] = useState('19:30')
  const [isActive, setIsActive] = useState(true)

  const generatedLabel = useMemo(() => {
    return buildSlotLabel(startTime, endTime)
  }, [startTime, endTime])

  const loadPage = useCallback(async () => {
    setLoading(true)
    setPageError('')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(authError.message)
      }

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: sellerData, error: sellerError } = await supabase
        .from('seller_profiles')
        .select('id, user_id, store_name, enable_delivery_slots')
        .eq('user_id', user.id)
        .maybeSingle()

      if (sellerError) {
        throw new Error(sellerError.message)
      }

      if (!sellerData) {
        throw new Error('Seller profile not found. Please complete onboarding/settings first.')
      }

      setSeller(sellerData as SellerProfileRow)
      setEnableDeliverySlots(Boolean(sellerData.enable_delivery_slots))

      const { data: slotData, error: slotError } = await supabase
        .from('delivery_slots')
        .select('*')
        .eq('seller_profile_id', sellerData.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (slotError) {
        throw new Error(slotError.message)
      }

      setSlots((slotData || []) as DeliverySlotRow[])
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load delivery slots page.'
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  function resetForm() {
    setEditingSlotId(null)
    setStartTime('18:30')
    setEndTime('19:30')
    setIsActive(true)
  }

  async function handleToggleFeature(nextValue: boolean) {
    if (!seller || savingToggle) return

    setEnableDeliverySlots(nextValue)
    setSavingToggle(true)

    const { error } = await supabase
      .from('seller_profiles')
      .update({
        enable_delivery_slots: nextValue,
      })
      .eq('id', seller.id)

    setSavingToggle(false)

    if (error) {
      alert(error.message)
      setEnableDeliverySlots(!nextValue)
      return
    }
  }

  function startEdit(slot: DeliverySlotRow) {
    setEditingSlotId(slot.id)
    setStartTime(slot.start_time)
    setEndTime(slot.end_time)
    setIsActive(slot.is_active)
  }

  async function handleSaveSlot() {
    if (!seller) {
      alert('Seller profile not ready yet.')
      return
    }

    const startMinutes = toMinutes(startTime)
    const endMinutes = toMinutes(endTime)

    if (startMinutes === null || endMinutes === null) {
      alert('Please select valid start time and end time.')
      return
    }

    if (startMinutes >= endMinutes) {
      alert('End time must be later than start time.')
      return
    }

    setSavingSlot(true)

    const label = buildSlotLabel(startTime, endTime)

    if (editingSlotId) {
      const existing = slots.find((slot) => slot.id === editingSlotId)

      const { error } = await supabase
        .from('delivery_slots')
        .update({
          label,
          start_time: startTime,
          end_time: endTime,
          is_active: isActive,
          sort_order: existing?.sort_order ?? 0,
        })
        .eq('id', editingSlotId)
        .eq('seller_profile_id', seller.id)

      setSavingSlot(false)

      if (error) {
        alert(error.message)
        return
      }

      resetForm()
      await loadPage()
      return
    }

    const nextSortOrder =
      slots.length > 0
        ? Math.max(...slots.map((slot) => Number(slot.sort_order || 0))) + 1
        : 1

    const { error } = await supabase.from('delivery_slots').insert({
      seller_profile_id: seller.id,
      label,
      start_time: startTime,
      end_time: endTime,
      is_active: isActive,
      sort_order: nextSortOrder,
    })

    setSavingSlot(false)

    if (error) {
      alert(error.message)
      return
    }

    resetForm()
    await loadPage()
  }

  async function handleDelete(slot: DeliverySlotRow) {
    const confirmed = window.confirm(`Delete slot "${slot.label}"?`)
    if (!confirmed) return

    const { error } = await supabase
      .from('delivery_slots')
      .delete()
      .eq('id', slot.id)
      .eq('seller_profile_id', slot.seller_profile_id)

    if (error) {
      alert(error.message)
      return
    }

    if (editingSlotId === slot.id) {
      resetForm()
    }

    await loadPage()
  }

  async function handleToggleSlotActive(slot: DeliverySlotRow) {
    const { error } = await supabase
      .from('delivery_slots')
      .update({
        is_active: !slot.is_active,
      })
      .eq('id', slot.id)
      .eq('seller_profile_id', slot.seller_profile_id)

    if (error) {
      alert(error.message)
      return
    }

    await loadPage()
  }

  const activeSlotsCount = useMemo(() => {
    return slots.filter((slot) => slot.is_active).length
  }, [slots])

  if (loading) {
    return <Layout>Loading...</Layout>
  }

  if (pageError) {
    return (
      <Layout>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-red-700">{pageError}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Slot Delivery
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Biarkan customer pilih slot penghantaran semasa checkout.
        </p>
      </div>

      <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Gunakan Slot Delivery
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Bila aktif, customer perlu pilih satu slot delivery sebelum bayar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggleFeature(!enableDeliverySlots)}
            disabled={savingToggle}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
              enableDeliverySlots ? 'bg-blue-600' : 'bg-slate-300'
            } ${savingToggle ? 'opacity-70' : ''}`}
            aria-pressed={enableDeliverySlots}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                enableDeliverySlots ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="mt-4">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
              enableDeliverySlots
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {enableDeliverySlots ? 'ON' : 'OFF'}
          </span>
        </div>

        {enableDeliverySlots && activeSlotsCount === 0 ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Aktifkan sekurang-kurangnya satu slot supaya customer boleh pilih semasa checkout.
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
            {editingSlotId ? 'Edit Slot' : 'Tambah Slot'}
          </h2>

          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Preview Label
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {generatedLabel}
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Active</span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveSlot}
                disabled={savingSlot}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                {savingSlot
                  ? 'Saving...'
                  : editingSlotId
                  ? 'Save Changes'
                  : '+ Add Slot'}
              </button>

              {editingSlotId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Slot List
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {slots.length} slot{slots.length === 1 ? '' : 's'} configured
              </p>
            </div>
          </div>

          {slots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Belum ada slot delivery. Tambah slot pertama anda.
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-900">
                        {slot.label}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {slot.start_time} - {slot.end_time}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          slot.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {slot.is_active ? 'Active' : 'Inactive'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleSlotActive(slot)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        {slot.is_active ? 'Set Inactive' : 'Set Active'}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(slot)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(slot)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
