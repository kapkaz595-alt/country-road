import '../globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Birge',
  description: 'Intercity ride sharing — cost sharing only',
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang={locale}>
      <body>
        <Header locale={locale} t={t} loggedIn={!!user} />
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">{children}</main>
      </body>
    </html>
  )
}