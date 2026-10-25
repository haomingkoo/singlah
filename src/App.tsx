import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { SearchPage } from './pages/SearchPage'
import { PlayerPage } from './pages/PlayerPage'
import { SavedPage } from './pages/SavedPage'
import { StateMessage } from './components/StateMessage'

function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-16">
      <StateMessage title="This page doesn't exist">Use Search or Saved to get back on track.</StateMessage>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<SearchPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* /play?id= is the canonical URL (served with HTTP 200); /play/:songId keeps old links working. */}
        <Route path="play" element={<PlayerPage />} />
        <Route path="play/:songId" element={<PlayerPage />} />
      </Routes>
    </BrowserRouter>
  )
}
