'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Locale } from '@/lib/locales'
import type { Dict } from '@/lib/i18n'

export default function AccountActions({
  locale,
  t,
  isAdmin,
}: {
  locale: Locale
  t: Dict
  isAdmin: boolean
}) {
  const router = useRouter()

  async function logout() {
    await createClient().auth.signOut()
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-2">
      {isAdmin && (
        <Link
          href={`/${locale}/admin`}
          className="block rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-stone-50"
        >
          {t.admin_title} →
        </Link>
      )}
      <button
        onClick={logout}
        className="block w-full rounded-xl px-3 py-3 text-left text-sm text-stone-600 hover:bg-stone-50"
      >
        {t.nav_logout}
      </button>
    </div>
  )
}
