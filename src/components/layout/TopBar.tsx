import { Link, NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4 md:px-8">
      <Link to="/" className="text-lg font-extrabold tracking-tight text-text">
        Sing<span className="text-primary">Lah</span>
      </Link>
      <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
        {[
          { to: '/', label: 'Search' },
          { to: '/saved', label: 'Saved' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'rounded-[6px] px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'text-primary' : 'text-text-dim hover:text-text'
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
