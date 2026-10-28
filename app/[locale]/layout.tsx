import '../globals.css'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Birge',
  description: 'Intercity ride sharing — cost sharing only',
}

export const viewport: Viewport = {
  themeColor: '#047857',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const t = getDict(locale)

  return (
    <html lang={locale}>
      <body>
        <Header locale={locale} />
        <main className="mx-auto max-w-2xl px-4 pb-28 pt-5">{children}</main>
        <BottomNav locale={locale} t={t} />
      </body>
    </html>
  )
}
