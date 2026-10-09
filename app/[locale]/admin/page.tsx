import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isLocale } from '@/lib/locales'
import { getDict } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import AdminReportActions from '@/components/AdminReportActions'
import AdminRouteRow from '@/components/AdminRouteRow'

type Report = {
  id: string
  reporter_id: string
  reported_user_id: string
  ride_id: string | null
  reason: string
  details: string | null
  status: string
  created_at: string
}
type Prof = { id: string; name: string | null; status: string }
type Route = {
  id: string
  from_city_id: string
  to_city_id: string
  distance_km: number | null
  price_per_seat: number
  is_active: boolean
}

const intlLocale: Record<string, string> = { kk: 'kk-KZ', ru: 'ru-RU', zh: 'zh-CN', en: 'en-GB' }

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)
  const tr = t as unknown as Record<string, string>

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) notFound()

  const [{ data: repData }, { data: routeData }, { data: cityData }] = await Promise.all([
    supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('routes').select('*').order('created_at'),
    supabase.from('cities').select('*'),
  ])
  const reports = (repData ?? []) as Report[]
  const routes = (routeData ?? []) as Route[]

  const cities = new Map(
    ((cityData ?? []) as Record<string, unknown>[]).map((c) => {
      const name = (c['name_' + locale] ?? c['name'] ?? c['name_kk'] ?? c['slug'] ?? '') as string
      return [c['id'] as string, name || String(c['id']).slice(0, 6)]
    }),
  )

  const userIds = Array.from(new Set(reports.flatMap((r) => [r.reporter_id, r.reported_user_id])))
  const { data: profData } = userIds.length
    ? await supabase.from('profiles').select('id,name,status').in('id', userIds)
    : { data: [] as Prof[] }
  const profiles = new Map(((profData ?? []) as Prof[]).map((p) => [p.id, p]))

  const validCount = new Map<string, number>()
  for (const r of reports) {
    if (r.status === 'reviewed') {
      validCount.set(r.reported_user_id, (validCount.get(r.reported_user_id) ?? 0) + 1)
    }
  }

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(intlLocale[locale] ?? 'en-GB', {
      timeZone: 'Asia/Almaty',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))

  const card = 'space-y-3 rounded-2xl border border-stone-200 bg-white p-4'

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">{t.admin_title}</h1>

      <section className="space-y-3">
        <h2 className="font-medium">{t.admin_reports}</h2>
        {reports.length === 0 && <p className="text-sm text-stone-500">{t.admin_no_reports}</p>}
        {reports.map((r) => {
          const reporter = profiles.get(r.reporter_id)
          const reported = profiles.get(r.reported_user_id)
          const userStatus = reported?.status ?? 'active'
          return (
            <div key={r.id} className={card}>
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium">{tr['reason_' + r.reason] ?? r.reason}</span>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs">
                  {tr['report_status_' + r.status] ?? r.status}
                </span>
              </div>
              <p className="text-xs text-stone-500">{fmt(r.created_at)}</p>
              {r.details && <p className="text-sm text-stone-700">“{r.details}”</p>}
              <div className="space-y-1 text-sm text-stone-600">
                <p>
                  {t.reporter_label}: <b>{reporter?.name || '—'}</b>
                </p>
                <p>
                  {t.reported_label}: <b>{reported?.name || '—'}</b> ·{' '}
                  {tr['user_status_' + userStatus] ?? userStatus} · ✔ {validCount.get(r.reported_user_id) ?? 0}
                </p>
                {r.ride_id && (
                  <Link href={`/${locale}/rides/${r.ride_id}`} className="text-emerald-800 underline">
                    #{r.ride_id.slice(0, 8)}
                  </Link>
                )}
              </div>
              <AdminReportActions
                t={t}
                reportId={r.id}
                reportStatus={r.status}
                reportedUserId={r.reported_user_id}
                userStatus={userStatus}
              />
            </div>
          )
        })}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">{t.admin_routes}</h2>
        <div className="space-y-2">
          {routes.map((r) => (
            <AdminRouteRow
              key={r.id}
              t={t}
              routeId={r.id}
              label={`${cities.get(r.from_city_id) ?? '?'} → ${cities.get(r.to_city_id) ?? '?'}`}
              distanceKm={r.distance_km}
              initialPrice={r.price_per_seat}
            />
          ))}
        </div>
      </section>
    </div>
  )
}