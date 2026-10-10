import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatPrice, pickName, type CityNames } from '@/lib/format'
import RequestPanel, { type ExistingRequest } from '@/components/RequestPanel'
import RideExtras from '@/components/RideExtras'
import { colorLabel } from '@/lib/colors'

type Ride = {
  id: string
  driver_id: string
  vehicle_id: string
  route_id: string
  from_point: string
  to_point: string
  depart_at: string
  seats_left: number
  seats_total: number
  price_per_seat: number
  note: string | null
  status: string
  no_smoking: boolean | null
  no_pets: boolean | null
  talk: string | null
}
type Driver = {
  name: string
  rating_avg: number | string
  rating_count: number
  completed_rides: number
}
type Vehicle = { brand: string; model: string; color: string; year: number | null }
type Review = { id: string; rating: number; comment: string | null }
type CityRow = CityNames & { id: string }

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

export default async function RideDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)

  const supabase = await createClient()

  const { data: rideData } = await supabase
    .from('rides')
    .select(
            'id,driver_id,vehicle_id,route_id,from_point,to_point,depart_at,seats_left,seats_total,price_per_seat,note,status,no_smoking,no_pets,talk'
    )
    .eq('id', id)
    .maybeSingle()
  if (!rideData) notFound()
  const ride = rideData as Ride

  const { data: routeData } = await supabase
    .from('routes')
    .select('from_city_id,to_city_id')
    .eq('id', ride.route_id)
    .maybeSingle()

  let routeLabel = ''
  if (routeData) {
    const route = routeData as { from_city_id: string; to_city_id: string }
    const { data: cityData } = await supabase
      .from('cities')
      .select('id,name_kk,name_ru,name_zh,name_en')
      .in('id', [route.from_city_id, route.to_city_id])
    const cityList = (cityData ?? []) as CityRow[]
    const fromCity = cityList.find((c) => c.id === route.from_city_id)
    const toCity = cityList.find((c) => c.id === route.to_city_id)
    routeLabel = `${pickName(fromCity, locale)} → ${pickName(toCity, locale)}`
  }

  const [{ data: driverData }, { data: vehicleData }, { data: reviewData }] = await Promise.all([
    supabase
      .from('profiles')
      .select('name,rating_avg,rating_count,completed_rides')
      .eq('id', ride.driver_id)
      .maybeSingle(),
    supabase
      .from('vehicles')
      .select('brand,model,color,year')
      .eq('id', ride.vehicle_id)
      .maybeSingle(),
    supabase
      .from('reviews')
      .select('id,rating,comment')
      .eq('reviewee_id', ride.driver_id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])
  const driver = driverData as Driver | null
  const vehicle = vehicleData as Vehicle | null
  const reviews = (reviewData ?? []) as Review[]

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let existing: ExistingRequest | null = null
  if (user && user.id !== ride.driver_id) {
    const { data: reqData } = await supabase
      .from('ride_requests')
      .select('id,status,seats')
      .eq('ride_id', ride.id)
      .eq('passenger_id', user.id)
      .maybeSingle()
    existing = (reqData as ExistingRequest | null) ?? null
  }

  const isOpen =
    (ride.status === 'published' || ride.status === 'confirmed') &&
    new Date(ride.depart_at).getTime() > Date.now() &&
    ride.seats_left > 0

  return (
    <div className="space-y-5">
      <Link href={`/${locale}`} className="text-sm text-stone-500">
        ← {t.back_home}
      </Link>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h1 className="text-xl font-semibold">{routeLabel}</h1>
        <div className="mt-3 divide-y divide-stone-100">
          <Row label={t.ride_departure} value={formatDateTime(ride.depart_at, locale)} />
          <Row label={t.ride_pickup} value={ride.from_point} />
          <Row label={t.ride_dropoff} value={ride.to_point} />
          <Row label={t.ride_seats_left} value={`${ride.seats_left} / ${ride.seats_total}`} />
          <Row
            label={t.ride_price}
            value={`${formatPrice(ride.price_per_seat)} ${t.per_seat}`}
          />
          {vehicle && (
            <Row
              label={t.ride_vehicle}
                            value={`${vehicle.brand} ${vehicle.model} · ${colorLabel(vehicle.color, locale)}${
                vehicle.year ? ` · ${vehicle.year}` : ''
              }`}
            />
          )}
        </div>
        {ride.note && (
          <div className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-sm">
            <p className="text-xs text-stone-500">{t.ride_note}</p>
            <p className="mt-1 whitespace-pre-line">{ride.note}</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm text-stone-500">{t.ride_driver}</h2>
        <p className="mt-1 text-lg font-semibold">{driver?.name || '—'}</p>
        <p className="text-sm text-stone-600">
          {driver && driver.rating_count > 0
            ? `★ ${Number(driver.rating_avg).toFixed(1)} (${driver.rating_count})`
            : t.new_driver}
          {driver ? ` · ${driver.completed_rides} ${t.rides_done}` : ''}
        </p>

        <h3 className="mt-4 text-sm font-medium">{t.ride_reviews}</h3>
        {reviews.length === 0 ? (
          <p className="mt-1 text-sm text-stone-500">{t.no_reviews}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg bg-stone-50 px-3 py-2 text-sm">
                <span className="font-medium">★ {r.rating}</span>
                {r.comment ? <span className="text-stone-700"> · {r.comment}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <RideExtras
        t={t}
        title={routeLabel}
        prefs={{ no_smoking: ride.no_smoking, no_pets: ride.no_pets, talk: ride.talk }}
      />

      {!user ? (
        <Link
          href={`/${locale}/login`}
          className="block rounded-2xl bg-emerald-700 px-5 py-3 text-center font-medium text-white"
        >
          {t.login_to_request}
        </Link>
      ) : user.id === ride.driver_id ? (
        <p className="rounded-2xl bg-stone-100 px-5 py-3 text-center text-sm text-stone-700">
          {t.own_ride}
        </p>
      ) : existing ? (
        <RequestPanel
          t={t}
          rideId={ride.id}
          userId={user.id}
          seatsLeft={ride.seats_left}
          existing={existing}
        />
      ) : !isOpen ? (
        <p className="rounded-2xl bg-stone-100 px-5 py-3 text-center text-sm text-stone-700">
          {t.ride_not_open}
        </p>
      ) : (
        <RequestPanel
          t={t}
          rideId={ride.id}
          userId={user.id}
          seatsLeft={ride.seats_left}
          existing={null}
        />
      )}

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-900">{t.safety_tip}</p>
    </div>
  )
}