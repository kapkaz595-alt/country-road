import Link from 'next/link'
import type { Locale } from '@/lib/locales'
import type { Dict } from '@/lib/i18n'
import { formatDateTime, formatPrice } from '@/lib/format'

export type RideItem = {
  id: string
  from_point: string
  to_point: string
  depart_at: string
  seats_left: number
  price_per_seat: number
}

export type DriverInfo = {
  name: string
  rating_avg: number | string
  rating_count: number
  completed_rides: number
}

export type VehicleInfo = {
  brand: string
  model: string
  color: string
}

export default function RideCard({
  locale,
  t,
  ride,
  routeLabel,
  driver,
  vehicle,
}: {
  locale: Locale
  t: Dict
  ride: RideItem
  routeLabel: string
  driver?: DriverInfo
  vehicle?: VehicleInfo
}) {
  return (
    <Link
      href={`/${locale}/rides/${ride.id}`}
      className="block rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-emerald-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{routeLabel}</p>
          <p className="text-sm text-stone-600">{formatDateTime(ride.depart_at, locale)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-emerald-700">
            {formatPrice(ride.price_per_seat)} {t.per_seat}
          </p>
          <p className="text-sm text-stone-600">
            {ride.seats_left} {t.seats_left}
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs text-stone-500">
        {ride.from_point} → {ride.to_point}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-sm">
        <div>
          <p className="font-medium">{driver?.name || '—'}</p>
          <p className="text-xs text-stone-500">
            {driver && driver.rating_count > 0
              ? `★ ${Number(driver.rating_avg).toFixed(1)} (${driver.rating_count})`
              : t.new_driver}
            {driver ? ` · ${driver.completed_rides} ${t.rides_done}` : ''}
          </p>
        </div>
        {vehicle && (
          <p className="text-right text-xs text-stone-500">
            {vehicle.brand} {vehicle.model} · {vehicle.color}
          </p>
        )}
      </div>

      <span className="mt-3 inline-block text-sm font-medium text-emerald-700">{t.view_ride} →</span>
    </Link>
  )
}
