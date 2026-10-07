import { notFound, redirect } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(`/${locale}/profile`)

  return <LoginForm locale={locale} t={getDict(locale)} />
}