import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useLyrics } from '../hooks/useLyrics'
import { useRomanizer } from '../hooks/useRomanizer'
import { useKaraokeSync } from '../hooks/useKaraokeSync'
import { useOfflineSongs } from '../hooks/useOfflineSongs'
import { useDisplayMode } from '../hooks/useDisplayMode'
import { usePitchDetection } from '../hooks/usePitchDetection'
import { usePartyMode } from '../hooks/usePartyMode'
import { usePartySync } from '../hooks/usePartySync'
import { SongHeader } from '../components/player/SongHeader'
import { LyricsScroller } from '../components/player/LyricsScroller'
import { PlayerControls } from '../components/player/PlayerControls'
import { PitchVisualizer } from '../components/player/PitchVisualizer'
import { PartyPanel } from '../components/player/PartyPanel'
import { AppShell } from '../components/layout/AppShell'
import { StateMessage } from '../components/StateMessage'
import { ERROR_COPY } from '../lib/errorCopy'
import { useBack } from '../hooks/useBack'

export function PlayerPage() {
  const { songId } = useParams<{ songId: string }>()
  const [params] = useSearchParams()
  const id = Number(songId ?? params.get('id'))
  const goBack = useBack()

  const { track, lines: rawLines, isLoading, error, retry } = useLyrics(id)
  const { lines, isRomanizing, japaneseLoading } = useRomanizer(rawLines)
  const sync = useKaraokeSync(lines, track?.duration ?? 0)
  const { isSaved, save, remove } = useOfflineSongs()
  const { mode: displayMode, cycle: cycleDisplayMode } = useDisplayMode()
  const [pitchEnabled, setPitchEnabled] = useState(false)
  const { pitchData } = usePitchDetection(pitchEnabled)
  const party = usePartyMode()
  const partySync = usePartySync(party, sync, id, lines)
  const [showPartyPanel, setShowPartyPanel] = useState(false)

  const handleToggleSave = async () => {
    if (!track) return
    if (isSaved(id)) {
      await remove(id)
    } else {
      await save({
        id: track.id,
        trackName: track.trackName,
        artistName: track.artistName,
        albumName: track.albumName,
        duration: track.duration,
        lines,
        savedAt: Date.now(),
      })
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-xl px-4 pt-10" role="status">
          <p className="text-[15px] text-text-dim">Loading lyrics…</p>
          <div className="mt-6 flex flex-col items-center gap-5" aria-hidden="true">
            {['w-3/4', 'w-2/3', 'w-4/5', 'w-1/2'].map((w) => (
              <div key={w} className={`h-6 animate-pulse rounded bg-surface-alt ${w}`} />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    const copy =
      error === 'no_synced'
        ? { title: 'This song has no synced lyrics', body: 'Search again and pick another version of the song.' }
        : ERROR_COPY[error]
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-xl px-4 pt-10">
          <button
            onClick={goBack}
            className="mb-4 inline-flex items-center gap-1 rounded-[6px] py-1 pr-2 text-[15px] font-medium text-text-dim hover:text-text"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </button>
          <StateMessage
            title={copy.title}
            onRetry={error === 'offline' || error === 'unavailable' ? retry : undefined}
            showSavedLink={error === 'offline' || error === 'unavailable'}
          >
            {copy.body}
          </StateMessage>
        </div>
      </AppShell>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-surface text-text">
      <SongHeader
        trackName={track?.trackName ?? ''}
        artistName={track?.artistName ?? ''}
        isSaved={isSaved(id)}
        onToggleSave={handleToggleSave}
      />

      {(isRomanizing || japaneseLoading) && (
        <div role="status" className="flex items-center justify-center gap-2 border-b border-line py-2 text-[13px] text-text-dim">
          <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
          {japaneseLoading ? 'Loading the Japanese reading guide…' : 'Adding romanisation…'}
        </div>
      )}

      {party.isInParty && (
        <div className="flex items-center justify-center gap-2 border-b border-line py-1.5 text-[13px]">
          <span className="text-primary">Room {party.roomCode}</span>
          <span className="text-text-dim">·</span>
          <span className="text-text-dim">{party.connectedCount} connected</span>
        </div>
      )}

      <LyricsScroller
        lines={lines}
        currentLineIndex={sync.currentLineIndex}
        displayMode={displayMode}
        elapsedTime={sync.elapsedTime}
        isPlaying={sync.isPlaying}
      />

      {pitchEnabled && <PitchVisualizer pitchData={pitchData} />}

      <PlayerControls
        isPlaying={sync.isPlaying}
        elapsedTime={sync.elapsedTime}
        duration={track?.duration ?? 0}
        playbackRate={sync.playbackRate}
        displayMode={displayMode}
        pitchEnabled={pitchEnabled}
        partyActive={party.isInParty}
        onTogglePlay={sync.togglePlay}
        onSeek={(time) => {
          sync.seek(time)
          partySync.broadcast()
        }}
        onSetPlaybackRate={sync.setPlaybackRate}
        onCycleDisplayMode={cycleDisplayMode}
        onTogglePitch={() => setPitchEnabled((p) => !p)}
        onOpenParty={() => setShowPartyPanel(true)}
      />

      {showPartyPanel && (
        <PartyPanel
          party={party}
          onClose={() => setShowPartyPanel(false)}
        />
      )}
    </div>
  )
}
