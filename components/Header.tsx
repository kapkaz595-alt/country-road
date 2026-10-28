'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { locales, localeNames, type Locale } from '@/lib/locales'

const TAGLINE: Record<Locale, string> = {
  kk: 'Бізбен бірге эко сапар',
  ru: 'Эко-поездки вместе с нами',
  zh: '与我们一起，绿色出行',
  en: 'Eco trips, together with us',
}

export default function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const router = useRouter()
  const rest = pathname.replace(/^\/(kk|ru|zh|en)/, '')

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <Link href={`/${locale}`} className="block leading-tight">
          <span className="block text-xl font-bold tracking-tight text-emerald-700">Birge</span>
          <span className="block text-[11px] text-stone-500">{TAGLINE[locale]}</span>
        </Link>
        <select
          aria-label="Language"
          value={locale}
          onChange={(e) => router.push(`/${e.target.value}${rest}`)}
          className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700"
        >
          {locales.map((l) => (
            <option key={l} value={l}>
              {localeNames[l]}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}
