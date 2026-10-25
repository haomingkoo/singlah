import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'
import { SiteFooter } from './SiteFooter'

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-surface text-text">
      <TopBar />
      <main className="flex flex-1 flex-col overflow-y-auto pb-20 md:pb-0">
        <div className="flex-1">{children ?? <Outlet />}</div>
        <SiteFooter />
      </main>
      <BottomNav />
    </div>
  )
}
