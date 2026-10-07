import { notFound, redirect } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/ProfileForm'
import VehicleSection, { type Vehicle } from '@/components/VehicleSection'

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const [{ data: profile }, { data: contacts }, { data: vehicles }] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).single(),
    supabase.from('contacts').select('phone,whatsapp,telegram').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('vehicles')
      .select('id,brand,model,color,year')
      .eq('user_id', user.id)
      .order('created_at'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t.profile_title}</h1>
      <ProfileForm
        t={t}
        userId={user.id}
        email={user.email ?? ''}
        emailVerified={!!user.email_confirmed_at}
        initial={{
          name: profile?.name ?? '',
          phone: contacts?.phone ?? '',
          whatsapp: contacts?.whatsapp ?? '',
          telegram: contacts?.telegram ?? '',
        }}
      />
      <VehicleSection t={t} userId={user.id} vehicles={(vehicles ?? []) as Vehicle[]} />
    </div>
  )
}