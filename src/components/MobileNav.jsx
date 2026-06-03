import './MobileNav.css'

// Bottom tab bar shown only on small screens (CSS-gated). Mirrors the sidebar's
// primary navigation in a native-app style. Playlists are reached via the
// "Плейлисты" tab (which opens the playlists view).
const TABS = [
  { view: 'library',   label: 'Главная',     icon: 'M3 11l9-8 9 8M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9' },
  { view: 'discover',  label: 'Чарты',       icon: 'M4 19V9M9 19V5M14 19v-7M19 19v-11' },
  { view: 'recommend', label: 'Для тебя',    icon: 'm12 3 2.1 5.2L19.5 9l-4 3.7 1 5.6L12 15.6 7.5 18.3l1-5.6-4-3.7 5.4-.8z' },
  { view: 'liked',     label: 'Любимое',     icon: 'M12 20s-7-4.3-9.2-8.5C1.3 8.3 2.8 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.2 0 4.7 3.3 3.2 6.5C19 15.7 12 20 12 20Z' },
  { view: 'playlists', label: 'Плейлисты',   icon: 'M4 7h11M4 12h11M4 17h7M18 16a2.4 2.4 0 1 0 0-.01M20.4 16V9.5l-2.6.8' },
]

export default function MobileNav({ activeView, onNav }) {
  return (
    <nav className="mobile-nav" aria-label="primary">
      {TABS.map(({ view, label, icon }) => (
        <button
          key={view}
          className={`mobile-nav__tab${activeView === view ? ' active' : ''}`}
          onClick={() => onNav(view, null)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
