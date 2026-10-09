'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

export default function CancelRideButton({
  t,
  rideId,
}: {
  t: Dict
  rideId: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function cancel() {
    if (!window.confirm(t.confirm_cancel_ride)) return
    setBusy(true)
    setError('')
    const { error } = await createClient()
      .from('rides')
      .update({ status: 'cancelled' })
      .eq('id', rideId)
    setBusy(false)
    if (error) {
      setError(t.error_generic)
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-1">
      <button
        onClick={cancel}
        disabled={busy}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-60"
      >
        {t.cancel_ride}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}