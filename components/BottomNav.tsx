'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/locales'
import type { Dict } from '@/lib/i18n'

type Tab = { key: string; href: string; label: string; match: (rest: string) => boolean; icon: ReactNode }

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const icons = {
  home: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9.5h13V10" />
    </svg>
  ),
  publish: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  trips: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
      <path d="M5 16.5V12l1.8-4.5A2 2 0 0 1 8.7 6h6.6a2 2 0 0 1 1.9 1.5L19 12v4.5" />
      <path d="M3.5 12h17M7 16.5v2M17 16.5v2" />
      <circle cx="8" cy="14.2" r=".6" />
      <circle cx="16" cy="14.2" r=".6" />
    </svg>
  ),
  me: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </svg>
  ),
}

const ME: Record<Locale, string> = { kk: 'Мен', ru: 'Я', zh: '我', en: 'Me' }

export default function BottomNav({ locale, t }: { locale: Locale; t: Dict }) {
  const pathname = usePathname()
  const rest = pathname.replace(/^\/(kk|ru|zh|en)/, '') || '/'

  const tabs: Tab[] = [
    { key: 'home', href: `/${locale}`, label: t.nav_home, match: (r) => r === '/' || r.startsWith('/rides'), icon: icons.home },
    { key: 'publish', href: `/${locale}/publish`, label: t.nav_publish, match: (r) => r.startsWith('/publish'), icon: icons.publish },
    { key: 'trips', href: `/${locale}/my-trips`, label: t.nav_my_trips, match: (r) => r.startsWith('/my-trips'), icon: icons.trips },
    {
      key: 'me',
      href: `/${locale}/profile`,
      label: ME[locale],
      match: (r) => r.startsWith('/profile') || r.startsWith('/login') || r.startsWith('/admin'),
      icon: icons.me,
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.match(rest)
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? 'text-emerald-700' : 'text-stone-500'
                }`}
              >
                {tab.icon}
                <span className="max-w-full truncate px-1">{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
