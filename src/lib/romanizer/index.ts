import type { TimedLine } from '../../types'
import { romanizeChinese } from './chineseRomanizer'
import { romanizeJapanese } from './japaneseRomanizer'
import { romanizeKorean } from './koreanRomanizer'

export async function romanizeLine(
  text: string,
  lang: string
): Promise<string> {
  switch (lang) {
    case 'zh':
      return romanizeChinese(text)
    case 'ja':
      return romanizeJapanese(text)
    case 'ko':
      return romanizeKorean(text)
    default:
      return text
  }
}

export async function romanizeAllLines(
  lines: TimedLine[]
): Promise<TimedLine[]> {
  const results = await Promise.allSettled(
    lines.map(async (line) => ({
      ...line,
      romanized:
        line.lang && ['zh', 'ja', 'ko'].includes(line.lang)
          ? await romanizeLine(line.text, line.lang)
          : undefined,
    }))
  )

  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : lines[i]
  )
}
