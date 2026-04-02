import { useState, useEffect, useCallback } from 'react'
import type { SavedSong } from '../types'
import * as store from '../lib/offlineStore'

export function useOfflineSongs() {
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([])

  const refresh = useCallback(async () => {
    const songs = await store.getAllSongs()
    setSavedSongs(songs.sort((a, b) => b.savedAt - a.savedAt))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(
    async (song: SavedSong) => {
      await store.saveSong(song)
      await refresh()
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: number) => {
      await store.deleteSong(id)
      await refresh()
    },
    [refresh]
  )

  const isSaved = useCallback(
    (id: number) => savedSongs.some((s) => s.id === id),
    [savedSongs]
  )

  return { savedSongs, save, remove, isSaved }
}
