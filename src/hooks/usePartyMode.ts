import { useState, useCallback, useRef, useEffect } from 'react'
import { PartySocket } from '../lib/partySocket'

export interface PartyState {
  isInParty: boolean
  isHost: boolean
  roomCode: string | null
  connectedCount: number
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
}

const BACKEND_URL = import.meta.env.VITE_PARTY_BACKEND_URL || ''

export function usePartyMode() {
  const [state, setState] = useState<PartyState>({
    isInParty: false,
    isHost: false,
    roomCode: null,
    connectedCount: 0,
    status: 'disconnected',
  })
  const socketRef = useRef<PartySocket | null>(null)
  const syncHandlerRef = useRef<((data: Record<string, unknown>) => void) | null>(null)

  const cleanup = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
    setState({
      isInParty: false,
      isHost: false,
      roomCode: null,
      connectedCount: 0,
      status: 'disconnected',
    })
  }, [])

  const createRoom = useCallback(async () => {
    if (!BACKEND_URL) return

    setState((s) => ({ ...s, status: 'connecting' }))

    try {
      const res = await fetch(`${BACKEND_URL}/rooms`, { method: 'POST' })
      const { code } = await res.json()

      const socket = new PartySocket()
      const wsUrl = BACKEND_URL.replace(/^http/, 'ws') + `/ws/${code}?role=host`
      await socket.connect(wsUrl)

      socket.on('room_joined', (data) => {
        setState((s) => ({
          ...s,
          isInParty: true,
          isHost: true,
          roomCode: String(data.code),
          connectedCount: Number(data.count),
          status: 'connected',
        }))
      })

      socket.on('count', (data) => {
        setState((s) => ({ ...s, connectedCount: Number(data.count) }))
      })

      socket.on('close', () => cleanup())

      socketRef.current = socket
    } catch {
      setState((s) => ({ ...s, status: 'error' }))
    }
  }, [cleanup])

  const joinRoom = useCallback(
    async (code: string) => {
      if (!BACKEND_URL) return

      setState((s) => ({ ...s, status: 'connecting' }))

      try {
        const check = await fetch(`${BACKEND_URL}/rooms/${code}`)
        const { exists } = await check.json()
        if (!exists) {
          setState((s) => ({ ...s, status: 'error' }))
          return
        }

        const socket = new PartySocket()
        const wsUrl = BACKEND_URL.replace(/^http/, 'ws') + `/ws/${code}?role=client`
        await socket.connect(wsUrl)

        socket.on('room_joined', (data) => {
          setState((s) => ({
            ...s,
            isInParty: true,
            isHost: false,
            roomCode: String(data.code),
            connectedCount: Number(data.count),
            status: 'connected',
          }))
        })

        socket.on('count', (data) => {
          setState((s) => ({ ...s, connectedCount: Number(data.count) }))
        })

        socket.on('room_closed', () => cleanup())
        socket.on('close', () => cleanup())

        socketRef.current = socket
      } catch {
        setState((s) => ({ ...s, status: 'error' }))
      }
    },
    [cleanup]
  )

  const leaveRoom = useCallback(() => {
    cleanup()
  }, [cleanup])

  const sendSync = useCallback(
    (data: { songId: number; elapsed: number; isPlaying: boolean; playbackRate: number }) => {
      socketRef.current?.send('sync', data as unknown as Record<string, unknown>)
    },
    []
  )

  const onSyncReceived = useCallback(
    (handler: (data: Record<string, unknown>) => void) => {
      // Remove old handler
      if (syncHandlerRef.current && socketRef.current) {
        socketRef.current.off('sync', syncHandlerRef.current)
      }
      syncHandlerRef.current = handler
      socketRef.current?.on('sync', handler)
    },
    []
  )

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return {
    ...state,
    createRoom,
    joinRoom,
    leaveRoom,
    sendSync,
    onSyncReceived,
    backendAvailable: !!BACKEND_URL,
  }
}
