import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex h-full flex-col bg-surface text-text">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
