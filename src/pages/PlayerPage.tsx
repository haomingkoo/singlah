import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLyrics } from '../hooks/useLyrics'
import { useRomanizer } from '../hooks/useRomanizer'
import { useKaraokeSync } from '../hooks/useKaraokeSync'
import { useOfflineSongs } from '../hooks/useOfflineSongs'
import { useDisplayMode } from '../hooks/useDisplayMode'
import { usePitchDetection } from '../hooks/usePitchDetection'
import { usePartyMode } from '../hooks/usePartyMode'
import { SongHeader } from '../components/player/SongHeader'
import { LyricsScroller } from '../components/player/LyricsScroller'
import { PlayerControls } from '../components/player/PlayerControls'
import { PitchVisualizer } from '../components/player/PitchVisualizer'
import { PartyPanel } from '../components/player/PartyPanel'

export function PlayerPage() {
  const { songId } = useParams<{ songId: string }>()
  const id = Number(songId)

  const { track, lines: rawLines, isLoading, error } = useLyrics(id)
  const { lines, isRomanizing, japaneseLoading } = useRomanizer(rawLines)
  const sync = useKaraokeSync(lines, track?.duration ?? 0)
  const { isSaved, save, remove } = useOfflineSongs()
  const { mode: displayMode, cycle: cycleDisplayMode } = useDisplayMode()
  const [pitchEnabled, setPitchEnabled] = useState(false)
  const { pitchData } = usePitchDetection(pitchEnabled)
  const party = usePartyMode()
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
      <div className="fixed inset-0 flex items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface px-4">
        <div className="rounded-xl bg-error/10 p-6 text-center text-error">
          {error}
        </div>
      </div>
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
        <div className="flex items-center justify-center gap-2 border-b border-surface-alt py-2 text-xs text-text-dim">
          <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
          {japaneseLoading
            ? 'Loading Japanese dictionary...'
            : 'Romanizing lyrics...'}
        </div>
      )}

      {party.isInParty && (
        <div className="flex items-center justify-center gap-2 border-b border-surface-alt py-1.5 text-xs">
          <span className="text-primary">Room {party.roomCode}</span>
          <span className="text-text-dim">·</span>
          <span className="text-text-dim">{party.connectedCount} connected</span>
        </div>
      )}

      <LyricsScroller
        lines={lines}
        currentLineIndex={sync.currentLineIndex}
        displayMode={displayMode}
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
        onSeek={sync.seek}
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
