'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

export default function CompleteRideButton({
  t,
  rideId,
}: {
  t: Dict
  rideId: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function complete() {
    if (!window.confirm(t.confirm_complete_ride)) return
    setBusy(true)
    setError('')
    const { error } = await createClient()
      .from('rides')
      .update({ status: 'completed' })
      .eq('id', rideId)
    setBusy(false)
    if (error) {
      const m = error.message.toLowerCase()
      setError(
        m.includes('depart') || m.includes('future') || m.includes('not yet') || m.includes('past')
          ? t.err_not_departed
          : t.error_generic,
      )
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-1">
      <button
        onClick={complete}
        disabled={busy}
        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {t.complete_ride}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}