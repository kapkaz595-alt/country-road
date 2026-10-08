import type { Locale } from './locales'

const tags: Record<Locale, string> = {
  kk: 'kk-KZ',
  ru: 'ru-RU',
  zh: 'zh-CN',
  en: 'en-GB',
}

// 按阿斯塔纳/阿拉木图时区（UTC+5）显示出发时间
export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(tags[locale], {
    timeZone: 'Asia/Almaty',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

// 今天的日期，格式 YYYY-MM-DD
export function todayAlmaty(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty' }).format(new Date())
}

export function formatPrice(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export type CityNames = {
  name_kk: string
  name_ru: string
  name_zh: string
  name_en: string
}

export function pickName(c: CityNames | undefined, locale: Locale): string {
  if (!c) return ''
  return c[`name_${locale}` as keyof CityNames] ?? c.name_kk
}
