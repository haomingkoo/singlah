import { pinyin } from 'pinyin-pro'

export function romanizeChinese(text: string): string {
  return pinyin(text, { toneType: 'symbol', type: 'string' })
}
