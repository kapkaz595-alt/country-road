type Counts = Record<string, number>

export type Stats = {
  users_total: number
  users_24h: number
  users_7d: number
  rides_total: number
  rides_by_status: Counts
  requests_total: number
  requests_by_status: Counts
  reviews_total: number
  reports_total: number
}

function Card({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <div className="text-2xl font-bold text-emerald-700">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
      {sub ? <div className="mt-1 text-[11px] text-stone-400">{sub}</div> : null}
    </div>
  )
}

function line(c: Counts | undefined) {
  if (!c) return ''
  return Object.entries(c)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')
}

export default function AdminStats({ stats }: { stats: Stats | null }) {
  if (!stats) return null
  return (
    <section className="mb-6 grid grid-cols-2 gap-3">
      <Card
        label="Users"
        value={stats.users_total}
        sub={`24h: +${stats.users_24h} · 7d: +${stats.users_7d}`}
      />
      <Card label="Rides" value={stats.rides_total} sub={line(stats.rides_by_status)} />
      <Card label="Requests" value={stats.requests_total} sub={line(stats.requests_by_status)} />
      <Card
        label="Reviews / Reports"
        value={stats.reviews_total}
        sub={`reports: ${stats.reports_total}`}
      />
    </section>
  )
}