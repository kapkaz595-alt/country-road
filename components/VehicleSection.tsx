'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

export type Vehicle = {
  id: string
  brand: string
  model: string
  color: string
  year: number | null
}

export default function VehicleSection({
  t,
  userId,
  vehicles,
}: {
  t: Dict
  userId: string
  vehicles: Vehicle[]
}) {
  const router = useRouter()
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')
  const [year, setYear] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await createClient()
      .from('vehicles')
      .insert({
        user_id: userId,
        brand: brand.trim(),
        model: model.trim(),
        color: color.trim(),
        year: year ? Number(year) : null,
      })
    setBusy(false)
    if (error) {
      setError(t.error_generic)
      return
    }
    setBrand('')
    setModel('')
    setColor('')
    setYear('')
    router.refresh()
  }

  async function remove(id: string) {
    const { error } = await createClient().from('vehicles').delete().eq('id', id)
    if (error) setError(t.error_generic)
    else router.refresh()
  }

  const input = 'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm'

  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="font-medium">{t.vehicle_title}</h2>

      {vehicles.length === 0 ? (
        <p className="text-sm text-stone-500">{t.no_vehicles}</p>
      ) : (
        <ul className="space-y-2">
          {vehicles.map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm"
            >
              <span>
                {v.brand} {v.model} · {v.color}
                {v.year ? ` · ${v.year}` : ''}
              </span>
              <button onClick={() => remove(v.id)} className="text-red-600">
                {t.delete}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="grid grid-cols-2 gap-3">
        <input required placeholder={t.brand} value={brand} onChange={(e) => setBrand(e.target.value)} className={input} />
        <input required placeholder={t.model} value={model} onChange={(e) => setModel(e.target.value)} className={input} />
        <input required placeholder={t.color} value={color} onChange={(e) => setColor(e.target.value)} className={input} />
        <input
          type="number"
          min={1990}
          max={2100}
          placeholder={t.year}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={input}
        />
        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="col-span-2 rounded-lg border border-emerald-700 py-2 text-sm font-medium text-emerald-700 disabled:opacity-60"
        >
          {t.add_vehicle}
        </button>
      </form>
    </section>
  )
}