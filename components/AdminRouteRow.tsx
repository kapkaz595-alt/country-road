'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

export default function AdminRouteRow({
  t,
  routeId,
  label,
  distanceKm,
  initialPrice,
}: {
  t: Dict
  routeId: string
  label: string
  distanceKm: number | null
  initialPrice: number
}) {
  const router = useRouter()
  const [price, setPrice] = useState(String(initialPrice))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function save() {
    setBusy(true)
    setMsg('')
    const { error } = await createClient().rpc('admin_set_route_price', {
      p_id: routeId,
      p_price: Number(price),
    })
    setBusy(false)
    if (error) {
      setMsg(t.error_generic)
      return
    }
    setMsg(t.admin_saved)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-stone-50 px-3 py-2 text-sm">
      <span className="min-w-0 flex-1">
        {label}
        {distanceKm ? <span className="text-stone-500"> · {distanceKm} km</span> : null}
      </span>
      <input
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-24 rounded-lg border border-stone-300 px-2 py-1"
      />
      <span className="text-stone-500">{t.admin_price_unit}</span>
      <button
        onClick={save}
        disabled={busy || price === '' || Number(price) < 0}
        className="rounded-lg bg-emerald-700 px-3 py-1 text-white disabled:opacity-60"
      >
        {t.admin_save}
      </button>
      {msg && <span className="text-xs text-stone-500">{msg}</span>}
    </div>
  )
}