'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

const REASONS = [
  'harassment',
  'fake_profile',
  'suspicious',
  'unsafe_driving',
  'no_show',
  'wrong_info',
  'commercial',
  'other',
] as const

export default function ReportForm({
  t,
  rideId,
  reporterId,
  reportedUserId,
}: {
  t: Dict
  rideId: string
  reporterId: string
  reportedUserId: string
}) {
  const tr = t as unknown as Record<string, string>
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string>('other')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await createClient().from('reports').insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      ride_id: rideId,
      reason,
      details: details.trim() || null,
    })
    setBusy(false)
    if (error) {
      setError(t.error_generic)
      return
    }
    setSent(true)
    setOpen(false)
  }

  if (sent) return <p className="text-xs text-stone-500">✓ {t.report_sent}</p>

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-red-600 underline">
        {t.report_btn}
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-red-200 bg-white p-3 text-sm">
      <p className="font-medium">{t.report_title}</p>
      <label className="block space-y-1">
        <span className="text-stone-600">{t.report_reason_label}</span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        >
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {tr['reason_' + r]}
            </option>
          ))}
        </select>
      </label>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder={t.report_details_label}
        className="w-full rounded-lg border border-stone-300 px-3 py-2"
      />
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-red-600 px-4 py-1.5 font-medium text-white disabled:opacity-60"
        >
          {t.report_submit}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-stone-300 px-4 py-1.5 text-stone-600"
        >
          ✕
        </button>
      </div>
    </form>
  )
} 