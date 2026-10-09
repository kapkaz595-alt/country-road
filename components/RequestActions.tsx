'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

export default function RequestActions({
  t,
  requestId,
}: {
  t: Dict
  requestId: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function update(status: 'accepted' | 'rejected') {
    setBusy(true)
    setError('')
    const { error } = await createClient()
      .from('ride_requests')
      .update({ status })
      .eq('id', requestId)
    setBusy(false)
    if (error) {
      setError(error.message.includes('not enough seats') ? t.err_not_enough : t.error_generic)
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => update('accepted')}
          disabled={busy}
          className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {t.accept}
        </button>
        <button
          onClick={() => update('rejected')}
          disabled={busy}
          className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm text-stone-700 disabled:opacity-60"
        >
          {t.decline}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}