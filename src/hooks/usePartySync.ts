import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TimedLine } from '../types'

const HEARTBEAT_MS = 3000
const MAX_DRIFT_PLAYING = 0.4
const MAX_DRIFT_PAUSED = 0.05

export interface RemoteState {
  songId: number
  elapsed: number
  isPlaying: boolean
  playbackRate: number
}

interface Position {
  elapsed: number
  isPlaying: boolean
  playbackRate: number
}

interface Party {
  isInParty: boolean
  isHost: boolean
  connectedCount: number
  sendSync: (data: RemoteState) => void
  onSyncReceived: (handler: ((data: Record<string, unknown>) => void) | null) => void
}

interface Sync {
  isPlaying: boolean
  playbackRate: number
  play: () => void
  pause: () => void
  seek: (time: number) => void
  setPlaybackRate: (rate: number) => void
  getPosition: () => Position
}

function parseRemote(data: Record<string, unknown>): RemoteState | null {
  const { songId, elapsed, isPlaying, playbackRate } = data
  if (typeof songId !== 'number' || typeof elapsed !== 'number' || typeof isPlaying !== 'boolean' || typeof playbackRate !== 'number') {
    return null
  }
  return { songId, elapsed, isPlaying, playbackRate }
}

/** Host broadcasts its position; guests follow it, including song changes and seeks. */
export function usePartySync(party: Party, sync: Sync, songId: number, lines: TimedLine[]) {
  const navigate = useNavigate()
  const remoteRef = useRef<{ state: RemoteState; at: number } | null>(null)
  const isHost = party.isInParty && party.isHost
  const isGuest = party.isInParty && !party.isHost
  const { sendSync, onSyncReceived } = party
  const { getPosition } = sync
  const hasLines = lines.length > 0

  const broadcast = useCallback(() => {
    if (isHost && hasLines) sendSync({ songId, ...getPosition() })
  }, [isHost, hasLines, sendSync, songId, getPosition])

  const apply = () => {
    const remote = remoteRef.current
    if (!isGuest || !remote) return
    const { state, at } = remote
    if (state.songId !== songId) {
      navigate(`/play?id=${state.songId}`)
      return
    }
    if (lines.length === 0) return

    const target = state.elapsed + (state.isPlaying ? ((performance.now() - at) / 1000) * state.playbackRate : 0)
    const pos = sync.getPosition()
    if (pos.playbackRate !== state.playbackRate) sync.setPlaybackRate(state.playbackRate)
    if (!state.isPlaying) sync.pause()
    const drift = Math.abs(sync.getPosition().elapsed - target)
    if (drift > (state.isPlaying ? MAX_DRIFT_PLAYING : MAX_DRIFT_PAUSED)) sync.seek(target)
    if (state.isPlaying) sync.play()
  }
  const applyRef = useRef(apply)
  applyRef.current = apply

  // Guest: take every host update, and re-apply when the song or its lines change underneath.
  useEffect(() => {
    if (!isGuest) return
    onSyncReceived((data) => {
      const state = parseRemote(data)
      if (!state) return
      remoteRef.current = { state, at: performance.now() }
      applyRef.current()
    })
    return () => onSyncReceived(null)
  }, [isGuest, onSyncReceived])

  useEffect(() => {
    applyRef.current()
  }, [songId, lines])

  useEffect(() => {
    if (!isGuest) remoteRef.current = null
  }, [isGuest])

  // Host: send on every play/pause/rate/song change, when someone joins, and on a heartbeat
  // so guests correct drift.
  useEffect(() => {
    broadcast()
  }, [broadcast, sync.isPlaying, sync.playbackRate, party.connectedCount])

  useEffect(() => {
    if (!isHost) return
    const id = setInterval(broadcast, HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [isHost, broadcast])

  return { broadcast }
}
