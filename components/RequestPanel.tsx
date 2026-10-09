'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

export type ExistingRequest = { id: string; status: string; seats: number }

export default function RequestPanel({
  t,
  rideId,
  userId,
  seatsLeft,
  existing,
}: {
  t: Dict
  rideId: string
  userId: string
  seatsLeft: number
  existing: ExistingRequest | null
}) {
  const router = useRouter()
  const [seats, setSeats] = useState('1')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)

  const statusLabel: Record<string, string> = {
    pending: t.status_pending,
    accepted: t.status_accepted,
    rejected: t.status_rejected,
    cancelled: t.status_cancelled,
  }
  const statusStyle: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800',
    accepted: 'bg-emerald-50 text-emerald-800',
    rejected: 'bg-red-50 text-red-700',
    cancelled: 'bg-stone-100 text-stone-600',
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    setIsError(false)
    const { error } = await createClient()
      .from('ride_requests')
      .insert({
        ride_id: rideId,
        passenger_id: userId,
        seats: Number(seats),
        message: message.trim() || null,
      })
    setBusy(false)

    if (error) {
      setIsError(true)
      if (error.code === '23505') setMsg(t.err_already)
      else if (error.message.includes('not enough seats')) setMsg(t.err_not_enough)
      else if (error.message.includes('ride not open')) setMsg(t.ride_not_open)
      else if (error.message.includes('own ride')) setMsg(t.own_ride)
      else setMsg(t.error_generic)
      return
    }
    setMsg(t.request_sent)
    router.refresh()
  }

  async function cancel() {
    if (!existing) return
    setBusy(true)
    setMsg('')
    setIsError(false)
    const { error } = await createClient()
      .from('ride_requests')
      .update({ status: 'cancelled' })
      .eq('id', existing.id)
    setBusy(false)
    if (error) {
      setIsError(true)
      setMsg(t.error_generic)
      return
    }
    router.refresh()
  }

  const input = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm'

  if (existing) {
    const canCancel = existing.status === 'pending' || existing.status === 'accepted'
    return (
      <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold">{t.request_status}</h2>
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm ${
            statusStyle[existing.status] ?? 'bg-stone-100 text-stone-600'
          }`}
        >
          {statusLabel[existing.status] ?? existing.status} · {existing.seats}
        </span>
        {existing.status === 'pending' && (
          <p className="text-xs text-stone-500">{t.contacts_after_accept}</p>
        )}
        {msg && <p className={isError ? 'text-sm text-red-600' : 'text-sm text-emerald-700'}>{msg}</p>}
        {canCancel && (
          <button
            onClick={cancel}
            disabled={busy}
            className="w-full rounded-lg border border-red-300 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
          >
            {t.request_cancel}
          </button>
        )}
      </section>
    )
  }

  const maxSeats = Math.max(1, Math.min(4, seatsLeft))

  return (
    <form onSubmit={send} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="font-semibold">{t.request_title}</h2>
      <label className="block text-sm">
        <span className="text-stone-600">{t.request_seats}</span>
        <select value={seats} onChange={(e) => setSeats(e.target.value)} className={input}>
          {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">{t.request_message}</span>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.request_message_ph}
          className={input}
        />
      </label>
      <p className="text-xs text-stone-500">{t.contacts_after_accept}</p>
      {msg && <p className={isError ? 'text-sm text-red-600' : 'text-sm text-emerald-700'}>{msg}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-emerald-700 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {t.request_send}
      </button>
    </form>
  )
}