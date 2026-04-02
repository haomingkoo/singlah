export interface LrcLibTrack {
  id: number
  name: string
  trackName: string
  artistName: string
  albumName: string
  duration: number
  instrumental: boolean
  plainLyrics: string | null
  syncedLyrics: string | null
}

export interface TimedLine {
  time: number
  text: string
  romanized?: string
  lang?: 'zh' | 'ja' | 'ko' | 'en' | 'other'
}

export interface SavedSong {
  id: number
  trackName: string
  artistName: string
  albumName: string
  duration: number
  lines: TimedLine[]
  savedAt: number
}

export interface SyncState {
  currentLineIndex: number
  elapsedTime: number
  isPlaying: boolean
  playbackRate: number
}
