import type { Locale } from './locales'

const COLORS: Record<string, Record<Locale, string>> = {
  white: { kk: 'Ақ', ru: 'Белый', zh: '白色', en: 'White' },
  black: { kk: 'Қара', ru: 'Чёрный', zh: '黑色', en: 'Black' },
  silver: { kk: 'Күміс', ru: 'Серебристый', zh: '银色', en: 'Silver' },
  gray: { kk: 'Сұр', ru: 'Серый', zh: '灰色', en: 'Gray' },
  red: { kk: 'Қызыл', ru: 'Красный', zh: '红色', en: 'Red' },
  blue: { kk: 'Көк', ru: 'Синий', zh: '蓝色', en: 'Blue' },
  green: { kk: 'Жасыл', ru: 'Зелёный', zh: '绿色', en: 'Green' },
  yellow: { kk: 'Сары', ru: 'Жёлтый', zh: '黄色', en: 'Yellow' },
  orange: { kk: 'Қызғылт сары', ru: 'Оранжевый', zh: '橙色', en: 'Orange' },
  brown: { kk: 'Қоңыр', ru: 'Коричневый', zh: '棕色', en: 'Brown' },
  beige: { kk: 'Беж', ru: 'Бежевый', zh: '米色', en: 'Beige' },
}

export const COLOR_KEYS = Object.keys(COLORS)

export function colorLabel(value: string, locale: Locale): string {
  const c = COLORS[value]
  return c ? c[locale] : value
}