import type { Dict } from '@/lib/i18n'

export type Contact = {
  phone: string | null
  whatsapp: string | null
  telegram: string | null
}

function onlyDigits(s: string): string {
  return s.replace(/\D/g, '')
}

export default function ContactCard({ t, contact }: { t: Dict; contact?: Contact }) {
  if (!contact || !(contact.phone || contact.whatsapp || contact.telegram)) {
    return <p className="text-xs text-stone-500">{t.no_contacts}</p>
  }

  const wa = contact.whatsapp ? onlyDigits(contact.whatsapp) : ''
  const tg = contact.telegram ? contact.telegram.replace(/^@/, '').trim() : ''
  const chip = 'rounded-lg bg-stone-100 px-3 py-1.5'

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {contact.phone && (
        <a href={`tel:${contact.phone}`} className={chip}>
          {t.phone}: {contact.phone}
        </a>
      )}
      {contact.whatsapp && wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
        >
          WhatsApp: {contact.whatsapp}
        </a>
      )}
      {tg && (
        <a
          href={`https://t.me/${encodeURIComponent(tg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
        >
          Telegram: @{tg}
        </a>
      )}
    </div>
  )
}