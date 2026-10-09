'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'
import type { Locale } from '@/lib/locales'
import { COLOR_KEYS, colorLabel } from '@/lib/colors'

export type Vehicle = {
  id: string
  brand: string
  model: string
  color: string
  year: number | null
}

const BRANDS = [
  'Toyota',
  'Hyundai',
  'Kia',
  'Chevrolet',
  'Lada (VAZ)',
  'Daewoo',
  'Nissan',
  'Mitsubishi',
  'Lexus',
  'Honda',
  'Mazda',
  'Skoda',
  'Volkswagen',
  'Renault',
  'Ford',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Subaru',
  'Suzuki',
  'Opel',
  'Peugeot',
  'Volvo',
  'Land Rover',
  'UAZ',
  'Chery',
  'Geely',
  'Haval',
  'Changan',
  'JAC',
  'BYD',
  'Jetour',
  'Exeed',
]

const OTHER = '__other__'

export default function VehicleSection({
  t,
  locale,
  userId,
  vehicles,
  plates,
}: {
  t: Dict
  locale: Locale
  userId: string
  vehicles: Vehicle[]
  plates: Record<string, string>
}) {
  const router = useRouter()
  const [brandSel, setBrandSel] = useState('')
  const [brandOther, setBrandOther] = useState('')
  const [model, setModel] = useState('')
  const [colorSel, setColorSel] = useState('')
  const [colorOther, setColorOther] = useState('')
  const [year, setYear] = useState('')
  const [plate, setPlate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const brand = brandSel === OTHER ? brandOther.trim() : brandSel
    const color = colorSel === OTHER ? colorOther.trim() : colorSel
    if (!brand || !color) return
    setBusy(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: userId,
        brand,
        model: model.trim(),
        color,
        year: year ? Number(year) : null,
      })
      .select('id')
      .single()
    if (error || !data) {
      setBusy(false)
      setError(t.error_generic)
      return
    }
    const { error: plateError } = await supabase.from('vehicle_plates').insert({
      vehicle_id: data.id,
      user_id: userId,
      plate: plate.trim().toUpperCase(),
    })
    if (plateError) {
      await supabase.from('vehicles').delete().eq('id', data.id)
      setBusy(false)
      setError(t.error_generic)
      return
    }
    setBusy(false)
    setBrandSel('')
    setBrandOther('')
    setModel('')
    setColorSel('')
    setColorOther('')
    setYear('')
    setPlate('')
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
              className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2 text-sm"
            >
              <span>
                                {v.brand} {v.model} · {colorLabel(v.color, locale)}
                {v.year ? ` · ${v.year}` : ''}
                {plates[v.id] ? (
                  <span className="ml-2 rounded bg-white px-2 py-0.5 font-mono text-xs ring-1 ring-stone-300">
                    {plates[v.id]}
                  </span>
                ) : null}
              </span>
              <button onClick={() => remove(v.id)} className="shrink-0 text-red-600">
                {t.delete}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="grid grid-cols-2 gap-3">
        <select
          required
          value={brandSel}
          onChange={(e) => setBrandSel(e.target.value)}
          className={`${input} bg-white`}
        >
          <option value="" disabled>
            {t.brand}
          </option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
          <option value={OTHER}>{t.reason_other}</option>
        </select>
        <input required placeholder={t.model} value={model} onChange={(e) => setModel(e.target.value)} className={input} />
        {brandSel === OTHER && (
          <input
            required
            placeholder={t.brand}
            value={brandOther}
            onChange={(e) => setBrandOther(e.target.value)}
            className={`${input} col-span-2`}
          />
        )}
        <select
          required
          value={colorSel}
          onChange={(e) => setColorSel(e.target.value)}
          className={`${input} bg-white`}
        >
          <option value="" disabled>
            {t.color}
          </option>
                    {COLOR_KEYS.map((k) => (
            <option key={k} value={k}>
              {colorLabel(k, locale)}
            </option>
          ))}
          <option value={OTHER}>{t.reason_other}</option>
        </select>
        <input
          type="number"
          min={1990}
          max={2100}
          placeholder={t.year}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={input}
        />
        {colorSel === OTHER && (
          <input
            required
            placeholder={t.color}
            value={colorOther}
            onChange={(e) => setColorOther(e.target.value)}
            className={`${input} col-span-2`}
          />
        )}
        <div className="col-span-2 space-y-1">
          <input
            required
            minLength={3}
            maxLength={15}
            placeholder={`${t.plate} · ${t.plate_placeholder}`}
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className={`${input} uppercase`}
          />
          <p className="text-xs text-stone-500">{t.plate_note}</p>
        </div>
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