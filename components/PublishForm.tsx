'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Locale } from '@/lib/locales'
import type { Dict } from '@/lib/i18n'
import { colorLabel } from '@/lib/colors'

export type City = {
  id: string
  name_kk: string
  name_ru: string
  name_zh: string
  name_en: string
}
export type RouteRow = {
  id: string
  from_city_id: string
  to_city_id: string
  price_per_seat: number
}
export type VehicleRow = {
  id: string
  brand: string
  model: string
  color: string
}

const LABELS: Record<Locale, { from: string; to: string }> = {
  kk: { from: 'Қайдан', to: 'Қайда' },
  ru: { from: 'Откуда', to: 'Куда' },
  zh: { from: '出发地', to: '目的地' },
  en: { from: 'From', to: 'To' },
}

function formatPrice(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function PublishForm({
  locale,
  t,
  userId,
  cities,
  routes,
  vehicles,
}: {
  locale: Locale
  t: Dict
  userId: string
  cities: City[]
  routes: RouteRow[]
  vehicles: VehicleRow[]
}) {
  const [fromCity, setFromCity] = useState(routes[0]?.from_city_id ?? '')
  const [toCity, setToCity] = useState(routes[0]?.to_city_id ?? '')
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? '')
  const [departAt, setDepartAt] = useState('')
  const [seats, setSeats] = useState('3')
  const [fromPoint, setFromPoint] = useState('')
  const [toPoint, setToPoint] = useState('')
  const [note, setNote] = useState('')
  const [ownTrip, setOwnTrip] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)

  function cityName(id: string): string {
    const c = cities.find((x) => x.id === id)
    if (!c) return ''
    const rec = c as unknown as Record<string, string>
    return rec[`name_${locale}`] ?? c.name_kk
  }

  const fromIds = Array.from(new Set(routes.map((r) => r.from_city_id)))
  const toIds = routes.filter((r) => r.from_city_id === fromCity).map((r) => r.to_city_id)
  const route = routes.find((r) => r.from_city_id === fromCity && r.to_city_id === toCity)

  function changeFrom(id: string) {
    setFromCity(id)
    const first = routes.find((r) => r.from_city_id === id)
    setToCity(first?.to_city_id ?? '')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    setIsError(false)
    if (!route) return

    const when = new Date(departAt)
    if (isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      setIsError(true)
      setMsg(t.err_past)
      return
    }

    setBusy(true)
    const { error } = await createClient()
      .from('rides')
      .insert({
        driver_id: userId,
        vehicle_id: vehicleId,
        route_id: route.id,
        from_point: fromPoint.trim(),
        to_point: toPoint.trim(),
        depart_at: when.toISOString(),
        seats_total: Number(seats),
        note: note.trim() || null,
        own_trip_confirmed: ownTrip,
      })
    setBusy(false)

    if (error) {
      setIsError(true)
      if (error.message.includes('daily limit')) setMsg(t.err_daily_limit)
      else if (error.message.includes('future')) setMsg(t.err_past)
      else setMsg(t.error_generic)
      return
    }

    setMsg(t.publish_success)
    setDepartAt('')
    setFromPoint('')
    setToPoint('')
    setNote('')
    setOwnTrip(false)
  }

  const input = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2'

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-stone-600">{LABELS[locale].from}</span>
          <select value={fromCity} onChange={(e) => changeFrom(e.target.value)} className={input}>
            {fromIds.map((id) => (
              <option key={id} value={id}>
                {cityName(id)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-stone-600">{LABELS[locale].to}</span>
          <select value={toCity} onChange={(e) => setToCity(e.target.value)} className={input}>
            {toIds.map((id) => (
              <option key={id} value={id}>
                {cityName(id)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {route && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3">
          <p className="text-xs text-emerald-800">{t.price_label}</p>
          <p className="text-xl font-semibold text-emerald-800">
            {formatPrice(route.price_per_seat)} {t.per_seat}
          </p>
          <p className="mt-1 text-xs text-emerald-700">{t.price_hint}</p>
        </div>
      )}

      <label className="block text-sm">
        <span className="text-stone-600">{t.vehicle}</span>
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className={input}>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} · {colorLabel(v.color, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="text-stone-600">{t.depart_at}</span>
        <input
          type="datetime-local"
          required
          value={departAt}
          onChange={(e) => setDepartAt(e.target.value)}
          className={input}
        />
      </label>

      <label className="block text-sm">
        <span className="text-stone-600">{t.seats}</span>
        <select value={seats} onChange={(e) => setSeats(e.target.value)} className={input}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="text-stone-600">{t.from_point}</span>
        <input required value={fromPoint} onChange={(e) => setFromPoint(e.target.value)} className={input} />
      </label>

      <label className="block text-sm">
        <span className="text-stone-600">{t.to_point}</span>
        <input required value={toPoint} onChange={(e) => setToPoint(e.target.value)} className={input} />
      </label>

      <label className="block text-sm">
        <span className="text-stone-600">{t.note}</span>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={input}
        />
      </label>

      <label className="flex items-start gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <input
          type="checkbox"
          required
          checked={ownTrip}
          onChange={(e) => setOwnTrip(e.target.checked)}
          className="mt-1"
        />
        <span>{t.own_trip_label}</span>
      </label>

      {msg && <p className={isError ? 'text-sm text-red-600' : 'text-sm text-emerald-700'}>{msg}</p>}

      <button
        type="submit"
        disabled={busy || !ownTrip || !route}
        className="w-full rounded-lg bg-emerald-700 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {t.publish_submit}
      </button>
    </form>
  )
}