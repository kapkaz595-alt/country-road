import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import { pickName, todayAlmaty } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import SearchForm, { type CityOption } from '@/components/SearchForm'
import RideCard, {
  type DriverInfo,
  type RideItem,
  type VehicleInfo,
} from '@/components/RideCard'

type RouteRow = { id: string; from_city_id: string; to_city_id: string }
type RideRow = RideItem & { driver_id: string; vehicle_id: string; route_id: string }
type DriverRow = DriverInfo & { id: string }
type VehicleRowFull = VehicleInfo & { id: string }

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)
  const sp = await searchParams

  const one = (k: string): string => {
    const v = sp[k]
    return typeof v === 'string' ? v : ''
  }
  const from = one('from')
  const to = one('to')
  const rawDate = one('date')
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : ''
  const seats = Math.min(4, Math.max(1, Number(one('seats')) || 1))
  const searched = Boolean(from || to || date || one('seats'))

  const supabase = await createClient()

  const [{ data: cityData }, { data: routeData }] = await Promise.all([
    supabase.from('cities').select('id,name_kk,name_ru,name_zh,name_en').order('name_en'),
    supabase.from('routes').select('id,from_city_id,to_city_id').eq('is_active', true),
  ])
  const cities = (cityData ?? []) as CityOption[]
  const routes = (routeData ?? []) as RouteRow[]

  const cityById = new Map<string, CityOption>()
  cities.forEach((c) => cityById.set(c.id, c))

  const routeLabelById = new Map<string, string>()
  routes.forEach((r) =>
    routeLabelById.set(
      r.id,
      `${pickName(cityById.get(r.from_city_id), locale)} → ${pickName(cityById.get(r.to_city_id), locale)}`
    )
  )

  const routeIds = routes
    .filter((r) => (!from || r.from_city_id === from) && (!to || r.to_city_id === to))
    .map((r) => r.id)

  // 时间范围：不早于现在；指定日期时按 UTC+5 的当天范围
  const nowIso = new Date().toISOString()
  let lower = nowIso
  let upper: string | null = null
  if (date) {
    const dayStart = new Date(`${date}T00:00:00+05:00`)
    if (!isNaN(dayStart.getTime())) {
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      if (dayStart.toISOString() > nowIso) lower = dayStart.toISOString()
      upper = dayEnd.toISOString()
    }
  }

  let rides: RideRow[] = []
  if (routeIds.length > 0) {
    let query = supabase
      .from('rides')
      .select('id,driver_id,vehicle_id,route_id,from_point,to_point,depart_at,seats_left,price_per_seat')
      .in('route_id', routeIds)
      .in('status', ['published', 'confirmed'])
      .gte('seats_left', seats)
      .gte('depart_at', lower)
    if (upper) query = query.lt('depart_at', upper)
    const { data } = await query.order('depart_at', { ascending: true }).limit(30)
    rides = (data ?? []) as RideRow[]
  }

  const drivers = new Map<string, DriverRow>()
  const vehicles = new Map<string, VehicleRowFull>()
  if (rides.length > 0) {
    const driverIds = Array.from(new Set(rides.map((r) => r.driver_id)))
    const vehicleIds = Array.from(new Set(rides.map((r) => r.vehicle_id)))
    const { data: dData } = await supabase
      .from('profiles')
      .select('id,name,rating_avg,rating_count,completed_rides')
      .in('id', driverIds)
    ;((dData ?? []) as DriverRow[]).forEach((d) => drivers.set(d.id, d))
    const { data: vData } = await supabase
      .from('vehicles')
      .select('id,brand,model,color')
      .in('id', vehicleIds)
    ;((vData ?? []) as VehicleRowFull[]).forEach((v) => vehicles.set(v.id, v))
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-emerald-700 p-5 text-white">
        <h1 className="text-xl font-bold leading-snug">{t.home_title}</h1>
        <p className="mt-1 text-sm text-emerald-50">{t.rule}</p>
      </div>

      <SearchForm
        locale={locale}
        t={t}
        cities={cities}
        values={{ from, to, date, seats }}
        today={todayAlmaty()}
      />

      <section className="space-y-3">
        <h2 className="font-semibold">{searched ? t.search_results : t.upcoming_rides}</h2>
        {rides.length === 0 ? (
          <p className="rounded-lg bg-stone-100 px-4 py-6 text-center text-sm text-stone-600">
            {t.no_rides}
          </p>
        ) : (
          rides.map((r) => (
            <RideCard
              key={r.id}
              locale={locale}
              t={t}
              ride={r}
              routeLabel={routeLabelById.get(r.route_id) ?? ''}
              driver={drivers.get(r.driver_id)}
              vehicle={vehicles.get(r.vehicle_id)}
            />
          ))
        )}
      </section>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-900">{t.home_publish_q}</p>
        <p className="mt-1 text-sm text-emerald-800">{t.publish_sub}</p>
        <Link
          href={`/${locale}/publish`}
          className="mt-3 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
        >
          {t.publish_title}
        </Link>
      </div>
    </div>
  )
}
