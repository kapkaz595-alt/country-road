export const locales = ['kk', 'ru', 'zh', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'kk'

export const localeNames: Record<Locale, string> = {
  kk: 'ҚАЗ',
  ru: 'РУС',
  zh: '中文',
  en: 'EN',
}

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v)
}
