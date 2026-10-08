import type { Locale } from '@/lib/locales'
import type { Dict } from '@/lib/i18n'
import { pickName, type CityNames } from '@/lib/format'

export type CityOption = CityNames & { id: string }

export default function SearchForm({
  locale,
  t,
  cities,
  values,
  today,
}: {
  locale: Locale
  t: Dict
  cities: CityOption[]
  values: { from: string; to: string; date: string; seats: number }
  today: string
}) {
  const field = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm'

  return (
    <form
      action={`/${locale}`}
      method="get"
      className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-stone-600">{t.search_from}</span>
          <select name="from" defaultValue={values.from} className={field}>
            <option value="">{t.any_city}</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {pickName(c, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-stone-600">{t.search_to}</span>
          <select name="to" defaultValue={values.to} className={field}>
            <option value="">{t.any_city}</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {pickName(c, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-stone-600">{t.search_date}</span>
          <input type="date" name="date" min={today} defaultValue={values.date} className={field} />
        </label>
        <label className="block text-sm">
          <span className="text-stone-600">{t.search_seats}</span>
          <select name="seats" defaultValue={String(values.seats)} className={field}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-700 py-2.5 font-medium text-white"
      >
        {t.search_btn}
      </button>
    </form>
  )
}
