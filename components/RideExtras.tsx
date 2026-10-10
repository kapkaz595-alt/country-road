import type { Dict } from '@/lib/i18n'
import ShareButton from '@/components/ShareButton'

export type RidePrefs = {
  no_smoking?: boolean | null
  no_pets?: boolean | null
  talk?: string | null
}

const CO2_KG_PER_KM = 0.17

function ecoText(
  t: Dict,
  distanceKm: number,
  seatsTotal: number,
  seatsLeft: number,
): string {
  const occupants = Math.min(seatsTotal - seatsLeft + 2, seatsTotal + 1)
  const carTotal = distanceKm * CO2_KG_PER_KM
  const share = carTotal / occupants
  const saved = carTotal - share
  const pct = Math.round((1 - 1 / occupants) * 100)
  return t.eco_text
    .replace('{saved}', saved.toFixed(1))
    .replace('{total}', share.toFixed(1))
    .replace('{pct}', String(pct))
}

export default function RideExtras({
  t,
  prefs,
  title,
  distanceKm,
  seatsTotal,
  seatsLeft,
}: {
  t: Dict
  prefs: RidePrefs
  title: string
  distanceKm?: number | null
  seatsTotal: number
  seatsLeft: number
}) {
  const tr = t as unknown as Record<string, string>
  const noSmoking = prefs.no_smoking ?? true
  const noPets = prefs.no_pets ?? true
  const talk = prefs.talk ?? 'flexible'

  return (
    <div className="space-y-4">
      <section className="space-y-2 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
        <h2 className="font-medium">{t.pref_title}</h2>
        <ul className="space-y-1 text-stone-700">
          <li>{noSmoking ? '🚭' : '🚬'} {noSmoking ? t.show_no_smoking : t.show_smoking_ok}</li>
          <li>{noPets ? '🐾' : '🐶'} {noPets ? t.show_no_pets : t.show_pets_ok}</li>
          <li>💬 {tr['talk_' + talk] ?? t.talk_flexible}</li>
        </ul>
        <p className="border-t border-stone-100 pt-2 text-stone-600">⏳ {t.approve_note}</p>
        {distanceKm ? (
          <p className="text-stone-600">🌱 {ecoText(t, distanceKm, seatsTotal, seatsLeft)}</p>
        ) : null}
      </section>

      <div className="flex justify-end">
        <ShareButton t={t} title={title} />
      </div>

      <p className="rounded-lg bg-stone-100 px-4 py-3 text-xs leading-relaxed text-stone-600">
        {t.disclaimer_text}
      </p>
    </div>
  )
}