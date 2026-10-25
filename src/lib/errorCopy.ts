import type { LyricsErrorKind } from './lrclib'

export const ERROR_COPY: Record<LyricsErrorKind, { title: string; body: string }> = {
  offline: {
    title: "You're offline",
    body: 'Saved songs still play without a connection.',
  },
  unavailable: {
    title: "The lyrics library isn't answering",
    body: 'This usually clears up within a few minutes. Saved songs still play.',
  },
  not_found: {
    title: "We couldn't find that song",
    body: 'The link may be out of date. Search for the song again.',
  },
}
