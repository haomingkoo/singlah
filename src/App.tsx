import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { SearchPage } from './pages/SearchPage'
import { PlayerPage } from './pages/PlayerPage'
import { SavedPage } from './pages/SavedPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<SearchPage />} />
          <Route path="play/:songId" element={<PlayerPage />} />
          <Route path="saved" element={<SavedPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
