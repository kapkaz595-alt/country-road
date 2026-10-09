'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

export default function AdminReportActions({
  t,
  reportId,
  reportStatus,
  reportedUserId,
  userStatus,
}: {
  t: Dict
  reportId: string
  reportStatus: string
  reportedUserId: string
  userStatus: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(fn: 'admin_set_report_status' | 'admin_set_profile_status', args: object) {
    setBusy(true)
    setError('')
    const { error } = await createClient().rpc(fn, args)
    setBusy(false)
    if (error) {
      setError(t.error_generic)
      return
    }
    router.refresh()
  }

  const btn = 'rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60'

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {reportStatus === 'open' && (
          <>
            <button
              disabled={busy}
              onClick={() => run('admin_set_report_status', { p_id: reportId, p_status: 'reviewed' })}
              className={`${btn} border-emerald-700 text-emerald-700`}
            >
              {t.mark_reviewed}
            </button>
            <button
              disabled={busy}
              onClick={() => run('admin_set_report_status', { p_id: reportId, p_status: 'dismissed' })}
              className={`${btn} border-stone-300 text-stone-600`}
            >
              {t.mark_dismissed}
            </button>
          </>
        )}
        {userStatus === 'suspended' ? (
          <button
            disabled={busy}
            onClick={() => run('admin_set_profile_status', { p_id: reportedUserId, p_status: 'active' })}
            className={`${btn} border-stone-300 text-stone-700`}
          >
            {t.restore_user}
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={() => run('admin_set_profile_status', { p_id: reportedUserId, p_status: 'suspended' })}
            className={`${btn} border-red-300 text-red-600`}
          >
            {t.suspend_user}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}