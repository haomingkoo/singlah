import { useState } from 'react'
import type { PartyState } from '../../hooks/usePartyMode'

interface PartyPanelProps {
  party: PartyState & {
    createRoom: () => Promise<void>
    joinRoom: (code: string) => Promise<void>
    leaveRoom: () => void
    backendAvailable: boolean
  }
  onClose: () => void
}

export function PartyPanel({ party, onClose }: PartyPanelProps) {
  const [joinCode, setJoinCode] = useState('')

  if (!party.backendAvailable) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
        <div className="w-full max-w-lg rounded-t-2xl bg-surface-alt p-6" onClick={(e) => e.stopPropagation()}>
          <p className="text-center text-text-dim">Party mode is not configured yet.</p>
          <button onClick={onClose} className="mt-4 w-full rounded-lg bg-surface-hover py-2 text-text-dim">
            Close
          </button>
        </div>
      </div>
    )
  }

  // In a party
  if (party.isInParty) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
        <div className="w-full max-w-lg rounded-t-2xl bg-surface-alt p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="mb-4 text-center text-lg font-semibold text-text">Party Mode</h3>
          <div className="mb-4 rounded-xl bg-surface p-4 text-center">
            <p className="text-xs text-text-dim">Room Code</p>
            <p className="text-4xl font-bold tracking-widest text-primary">{party.roomCode}</p>
            <p className="mt-2 text-xs text-text-dim">
              {party.connectedCount} connected · {party.isHost ? 'You are the host' : 'Synced to host'}
            </p>
          </div>
          <button
            onClick={() => { party.leaveRoom(); onClose() }}
            className="w-full rounded-lg bg-error/20 py-3 text-sm font-medium text-error"
          >
            Leave Room
          </button>
        </div>
      </div>
    )
  }

  // Not in a party
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl bg-surface-alt p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-center text-lg font-semibold text-text">Party Mode</h3>

        <button
          onClick={party.createRoom}
          disabled={party.status === 'connecting'}
          className="mb-4 w-full rounded-lg bg-primary py-3 text-sm font-medium text-surface disabled:opacity-50"
        >
          {party.status === 'connecting' ? 'Creating...' : 'Create Room'}
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            maxLength={4}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Room code"
            className="flex-1 rounded-lg bg-surface px-4 py-3 text-center text-lg tracking-widest text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => joinCode.length === 4 && party.joinRoom(joinCode)}
            disabled={joinCode.length !== 4 || party.status === 'connecting'}
            className="rounded-lg bg-surface-hover px-6 py-3 text-sm font-medium text-text disabled:opacity-50"
          >
            Join
          </button>
        </div>

        {party.status === 'error' && (
          <p className="mt-3 text-center text-sm text-error">Failed to connect. Check the room code.</p>
        )}

        <button onClick={onClose} className="mt-4 w-full rounded-lg py-2 text-sm text-text-dim">
          Cancel
        </button>
      </div>
    </div>
  )
}
