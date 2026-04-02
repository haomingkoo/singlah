import type { TimedLine } from '../types'

type Lang = 'zh' | 'ja' | 'ko' | 'en' | 'other'

const HIRAGANA = /[\u3040-\u309f]/
const KATAKANA = /[\u30a0-\u30ff]/
const HANGUL = /[\uac00-\ud7af\u1100-\u11ff]/
const CJK_UNIFIED = /[\u4e00-\u9fff]/
const ASCII_TEXT = /^[a-zA-Z0-9\s.,!?'"()\-:;@#$%^&*\[\]{}|/\\~`+=<>]+$/

export function detectLanguage(text: string): Lang {
  if (HIRAGANA.test(text) || KATAKANA.test(text)) return 'ja'
  if (HANGUL.test(text)) return 'ko'
  if (CJK_UNIFIED.test(text)) return 'zh'
  if (ASCII_TEXT.test(text)) return 'en'
  return 'other'
}

export function detectLanguages(lines: TimedLine[]): TimedLine[] {
  return lines.map((line) => ({
    ...line,
    lang: detectLanguage(line.text),
  }))
}
