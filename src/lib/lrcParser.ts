import type { TimedLine } from '../types'

const LRC_LINE_RE = /^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s?(.*)/

export function parseLrc(lrc: string): TimedLine[] {
  const lines = lrc.trim().split('\n')
  const result: TimedLine[] = []

  for (const line of lines) {
    const match = line.match(LRC_LINE_RE)
    if (!match) continue

    const [, min, sec, ms, text] = match
    const time =
      parseInt(min) * 60 +
      parseInt(sec) +
      parseInt(ms.padEnd(3, '0')) / 1000

    if (text.trim()) {
      result.push({ time, text: text.trim() })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}
