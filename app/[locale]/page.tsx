import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-emerald-700 p-6 text-white">
        <h1 className="text-2xl font-bold leading-snug">{t.home_title}</h1>
        <p className="mt-2 text-emerald-50">{t.home_sub}</p>
        <Link
          href={user ? `/${locale}/profile` : `/${locale}/login`}
          className="mt-5 inline-block rounded-lg bg-white px-4 py-2 font-medium text-emerald-800"
        >
          {user ? t.home_cta_profile : t.home_cta_login}
        </Link>
      </div>
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">{t.rule}</p>
    </div>
  )
}