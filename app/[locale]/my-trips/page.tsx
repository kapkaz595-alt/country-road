import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import ContactCard from '@/components/ContactCard'
import RequestActions from '@/components/RequestActions'
import CancelRideButton from '@/components/CancelRideButton'
import CompleteRideButton from '@/components/CompleteRideButton'
import ReviewForm from '@/components/ReviewForm'
import ReportForm from '@/components/ReportForm'

type ContactProp = React.ComponentProps<typeof ContactCard>['contact']

type Ride = {
  id: string
  driver_id: string
  vehicle_id: string | null
  from_point: string
  to_point: string
  depart_at: string
  seats_total: number
  seats_left: number
  price_per_seat: number
  status: string
}
type Req = {
  id: string
  ride_id: string
  passenger_id: string
  seats: number
  message: string | null
  status: string
}
type Prof = { id: string; name: string | null; rating_avg: number | null; rating_count: number | null }
type ContactRow = { user_id: string; phone: string | null; whatsapp: string | null; telegram: string | null }

const intlLocale: Record<string, string> = { kk: 'kk-KZ', ru: 'ru-RU', zh: 'zh-CN', en: 'en-GB' }

export default async function MyTripsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)
  const tr = t as unknown as Record<string, string>

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(intlLocale[locale] ?? 'en-GB', {
      timeZone: 'Asia/Almaty',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))

  const [{ data: pubData }, { data: myReqData }, { data: myReviewData }] = await Promise.all([
    supabase.from('rides').select('*').eq('driver_id', user.id).order('depart_at', { ascending: false }),
    supabase
      .from('ride_requests')
      .select('id,ride_id,passenger_id,seats,message,status')
      .eq('passenger_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('reviews').select('ride_id,reviewee_id').eq('reviewer_id', user.id),
  ])
  const published = (pubData ?? []) as Ride[]
  const myReqs = (myReqData ?? []) as Req[]
  const reviewed = new Set(
    ((myReviewData ?? []) as { ride_id: string; reviewee_id: string }[]).map(
      (r) => `${r.ride_id}:${r.reviewee_id}`,
    ),
  )

  const pubIds = published.map((r) => r.id)
  const reqRideIds = myReqs.map((r) => r.ride_id)

  const [{ data: inData }, { data: reqRidesData }] = await Promise.all([
    pubIds.length
      ? supabase
          .from('ride_requests')
          .select('id,ride_id,passenger_id,seats,message,status')
          .in('ride_id', pubIds)
          .order('created_at')
      : Promise.resolve({ data: [] as Req[] }),
    reqRideIds.length
      ? supabase.from('rides').select('*').in('id', reqRideIds)
      : Promise.resolve({ data: [] as Ride[] }),
  ])
  const incoming = (inData ?? []) as Req[]
  const reqRides = new Map(((reqRidesData ?? []) as Ride[]).map((r) => [r.id, r]))

  const profileIds = Array.from(
    new Set([
      ...incoming.map((r) => r.passenger_id),
      ...Array.from(reqRides.values()).map((r) => r.driver_id),
    ]),
  )
  const contactIds = Array.from(
    new Set([
      ...incoming.filter((r) => r.status === 'accepted').map((r) => r.passenger_id),
      ...myReqs
        .filter((r) => r.status === 'accepted')
        .map((r) => reqRides.get(r.ride_id)?.driver_id)
        .filter((x): x is string => !!x),
    ]),
  )

  const [{ data: profData }, { data: contData }] = await Promise.all([
    profileIds.length
      ? supabase.from('profiles').select('id,name,rating_avg,rating_count').in('id', profileIds)
      : Promise.resolve({ data: [] as Prof[] }),
    contactIds.length
      ? supabase.from('contacts').select('user_id,phone,whatsapp,telegram').in('user_id', contactIds)
      : Promise.resolve({ data: [] as ContactRow[] }),
  ])
  const profiles = new Map(((profData ?? []) as Prof[]).map((p) => [p.id, p]))
  const contacts = new Map(((contData ?? []) as ContactRow[]).map((c) => [c.user_id, c]))

  const plateVehicleIds = Array.from(
    new Set(
      myReqs
        .filter((r) => r.status === 'accepted')
        .map((r) => reqRides.get(r.ride_id)?.vehicle_id)
        .filter((x): x is string => !!x),
    ),
  )
  const { data: plateData } = plateVehicleIds.length
    ? await supabase.from('vehicle_plates').select('vehicle_id,plate').in('vehicle_id', plateVehicleIds)
    : { data: [] as { vehicle_id: string; plate: string }[] }
  const plates = new Map(
    ((plateData ?? []) as { vehicle_id: string; plate: string }[]).map((p) => [p.vehicle_id, p.plate]),
  )

  const statusLabel = (s: string) => tr['status_' + s] ?? s
  const rideStatusLabel = (s: string) => tr['ride_status_' + s] ?? s

  const rating = (p?: Prof) =>
    p && p.rating_count ? `★ ${Number(p.rating_avg ?? 0).toFixed(1)} (${p.rating_count})` : ''

  const card = 'space-y-3 rounded-2xl border border-stone-200 bg-white p-4'

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">{t.trips_title}</h1>

      <section className="space-y-3">
        <h2 className="font-medium">{t.trips_published}</h2>
        {published.length === 0 && <p className="text-sm text-stone-500">{t.no_published}</p>}
        {published.map((ride) => {
          const reqs = incoming.filter((r) => r.ride_id === ride.id)
          const open = ride.status === 'published' || ride.status === 'confirmed'
          const done = ride.status === 'completed'
          return (
            <div key={ride.id} className={card}>
              <div className="flex items-start justify-between gap-3">
                <Link href={`/${locale}/rides/${ride.id}`} className="font-medium text-emerald-800">
                  {ride.from_point} → {ride.to_point}
                </Link>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs">
                  {rideStatusLabel(ride.status)}
                </span>
              </div>
              <p className="text-sm text-stone-600">
                {fmt(ride.depart_at)} · {ride.seats_left}/{ride.seats_total} · {ride.price_per_seat} ₸
              </p>

              <div className="space-y-2 border-t border-stone-100 pt-3">
                <p className="text-sm font-medium">{t.requests_for_ride}</p>
                {reqs.length === 0 && <p className="text-sm text-stone-500">{t.no_requests_yet}</p>}
                {reqs.map((rq) => {
                  const p = profiles.get(rq.passenger_id)
                  return (
                    <div key={rq.id} className="space-y-2 rounded-lg bg-stone-50 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span>
                          {t.passenger_label}: <b>{p?.name || '—'}</b> {rating(p)}
                        </span>
                        <span className="text-xs text-stone-500">{statusLabel(rq.status)}</span>
                      </div>
                      <p className="text-stone-600">
                        {t.seats_requested}: {rq.seats}
                      </p>
                      {rq.message && <p className="text-stone-600">“{rq.message}”</p>}
                      {rq.status === 'pending' && open && <RequestActions t={t} requestId={rq.id} />}
                      {rq.status === 'accepted' && (
                        <ContactCard
                          t={t}
                          contact={contacts.get(rq.passenger_id) as unknown as ContactProp}
                        />
                      )}

                      {rq.status === 'accepted' && (
                        <ReportForm
                          t={t}
                          rideId={ride.id}
                          reporterId={user.id}
                          reportedUserId={rq.passenger_id}
                        />
                      )}

                      {rq.status === 'accepted' && done && (
                        reviewed.has(`${ride.id}:${rq.passenger_id}`) ? (
                          <p className="text-xs text-emerald-700">✓ {t.review_done}</p>
                        ) : (
                          <ReviewForm
                            t={t}
                            rideId={ride.id}
                            reviewerId={user.id}
                            revieweeId={rq.passenger_id}
                            revieweeName={p?.name || '—'}
                          />
                        )
                      )}
                    </div>
                  )
                })}
              </div>

              {open && (
                <div className="flex flex-wrap gap-2">
                  <CompleteRideButton t={t} rideId={ride.id} />
                  <CancelRideButton t={t} rideId={ride.id} />
                </div>
              )}
            </div>
          )
        })}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">{t.trips_requested}</h2>
        {myReqs.length === 0 && <p className="text-sm text-stone-500">{t.no_requested}</p>}
        {myReqs.map((rq) => {
          const ride = reqRides.get(rq.ride_id)
          if (!ride) return null
          const d = profiles.get(ride.driver_id)
          return (
            <div key={rq.id} className={card}>
              <div className="flex items-start justify-between gap-3">
                <Link href={`/${locale}/rides/${ride.id}`} className="font-medium text-emerald-800">
                  {ride.from_point} → {ride.to_point}
                </Link>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs">
                  {statusLabel(rq.status)}
                </span>
              </div>
              <p className="text-sm text-stone-600">
                {fmt(ride.depart_at)} · {rq.seats} · {ride.price_per_seat} ₸ · {rideStatusLabel(ride.status)}
              </p>
              <p className="text-sm text-stone-600">
                {d?.name || '—'} {rating(d)}
              </p>
              {rq.status === 'accepted' && (
                <ContactCard
                  t={t}
                  contact={contacts.get(ride.driver_id) as unknown as ContactProp}
                />
              )}

              {rq.status === 'accepted' && ride.vehicle_id && plates.get(ride.vehicle_id) && (
                <p className="text-sm text-stone-700">
                  {t.plate}:{' '}
                  <span className="rounded bg-stone-100 px-2 py-0.5 font-mono">
                    {plates.get(ride.vehicle_id)}
                  </span>
                </p>
              )}

              {rq.status === 'accepted' && (
                <ReportForm
                  t={t}
                  rideId={ride.id}
                  reporterId={user.id}
                  reportedUserId={ride.driver_id}
                />
              )}

              {rq.status === 'accepted' && ride.status === 'completed' && (
                reviewed.has(`${ride.id}:${ride.driver_id}`) ? (
                  <p className="text-xs text-emerald-700">✓ {t.review_done}</p>
                ) : (
                  <ReviewForm
                    t={t}
                    rideId={ride.id}
                    reviewerId={user.id}
                    revieweeId={ride.driver_id}
                    revieweeName={d?.name || '—'}
                  />
                )
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}