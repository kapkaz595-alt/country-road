import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import PublishForm, { type City, type RouteRow, type VehicleRow } from '@/components/PublishForm'

export default async function PublishPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const [{ data: cities }, { data: routes }, { data: vehicles }] = await Promise.all([
    supabase.from('cities').select('id,name_kk,name_ru,name_zh,name_en'),
    supabase
      .from('routes')
      .select('id,from_city_id,to_city_id,price_per_seat')
      .eq('is_active', true)
      .order('distance_km'),
    supabase
      .from('vehicles')
      .select('id,brand,model,color')
      .eq('user_id', user.id)
      .order('created_at'),
  ])

  const vehicleList = (vehicles ?? []) as VehicleRow[]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">{t.publish_title}</h1>
        <p className="mt-1 text-sm text-stone-600">{t.publish_sub}</p>
      </div>

      {vehicleList.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-700">{t.err_no_vehicle}</p>
          <Link
            href={`/${locale}/profile`}
            className="inline-block rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
          >
            {t.go_profile}
          </Link>
        </div>
      ) : (
        <PublishForm
          locale={locale}
          t={t}
          userId={user.id}
          cities={(cities ?? []) as City[]}
          routes={(routes ?? []) as RouteRow[]}
          vehicles={vehicleList}
        />
      )}
    </div>
  )
}
