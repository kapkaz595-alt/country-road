'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { locales, localeNames, type Locale } from '@/lib/locales'
import type { Dict } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'

export default function Header({
  locale,
  t,
  loggedIn,
}: {
  locale: Locale
  t: Dict
  loggedIn: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const rest = pathname.replace(/^\/(kk|ru|zh|en)/, '')

  async function logout() {
    await createClient().auth.signOut()
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href={`/${locale}`} className="text-lg font-bold tracking-tight text-emerald-700">
          Birge
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {locales.map((l) => (
            <Link
              key={l}
              href={`/${l}${rest}`}
              className={l === locale ? 'font-semibold text-emerald-700' : 'text-stone-500'}
            >
              {localeNames[l]}
            </Link>
          ))}
        </div>
      </div>
      <nav className="mx-auto flex max-w-2xl flex-wrap gap-x-5 gap-y-1 px-4 pb-2 text-sm text-stone-600">
        <Link href={`/${locale}`}>{t.nav_home}</Link>
        <Link href={`/${locale}/publish`}>{t.nav_publish}</Link>
        {loggedIn ? (
          <>
            <Link href={`/${locale}/profile`}>{t.nav_profile}</Link>
            <button onClick={logout} className="text-stone-500">
              {t.nav_logout}
            </button>
          </>
        ) : (
          <Link href={`/${locale}/login`}>{t.nav_login}</Link>
        )}
      </nav>
    </header>
  )
}
