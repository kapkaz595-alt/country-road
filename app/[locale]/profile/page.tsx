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

  const [{ data: profile }, { data: contacts }, { data: vehicles }, { data: plateRows }] =
    await Promise.all([
      supabase.from('profiles').select('name').eq('id', user.id).single(),
      supabase.from('contacts').select('phone,whatsapp,telegram').eq('user_id', user.id).maybeSingle(),
      supabase
        .from('vehicles')
        .select('id,brand,model,color,year')
        .eq('user_id', user.id)
        .order('created_at'),
      supabase.from('vehicle_plates').select('vehicle_id,plate').eq('user_id', user.id),
    ])

  const plates: Record<string, string> = {}
  for (const p of (plateRows ?? []) as { vehicle_id: string; plate: string }[]) {
    plates[p.vehicle_id] = p.plate
  }

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
            <VehicleSection
        t={t}
        locale={locale}
        userId={user.id}
        vehicles={(vehicles ?? []) as Vehicle[]}
        plates={plates}
      />
    </div>
  )
}