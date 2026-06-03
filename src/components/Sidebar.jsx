import './Sidebar.css'

const ICONS = {
  library: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V5a1 1 0 0 1 1-1h3v15H5a1 1 0 0 1-1-1Z" />
      <path d="M11 19V4h3v15h-3Z" />
      <path d="m17 5 3.2 13.5a1 1 0 0 1-.74 1.2l-1.5.35" />
    </svg>
  ),
  playlists: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h11M4 12h11M4 17h7" />
      <circle cx="18" cy="16" r="2.4" />
      <path d="M20.4 16V9.5l-2.6.8" />
    </svg>
  ),
  discover: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  liked: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.3-9.2-8.5C1.3 8.3 2.8 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.2 0 4.7 3.3 3.2 6.5C19 15.7 12 20 12 20Z" />
    </svg>
  ),
}

const NAV_ITEMS = [
  { view: 'library',   label: 'Коллекция'     },
  { view: 'playlists', label: 'Плейлисты'     },
  { view: 'discover',  label: 'Новинки'       },
  { view: 'liked',     label: 'Мне нравится'  },
]

export default function Sidebar({ activeView, activePlaylistId, playlists, onNav, onNewPlaylist }) {
  return (
    <nav className="sidebar">
      <div className="sidebar__nav">
        {NAV_ITEMS.map(({ view, label }) => (
          <button
            key={view}
            className={`sidebar__nav-item${activeView === view && !activePlaylistId ? ' active' : ''}`}
            onClick={() => onNav(view, null)}
          >
            <span className="sidebar__icon">{ICONS[view]}</span>
            <span className="sidebar__label">{label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar__section">
        <span>Мои подборки</span>
        <button className="sidebar__new-playlist" aria-label="new playlist" onClick={onNewPlaylist}>+</button>
      </div>

      <div className="sidebar__playlists">
        {playlists.map(p => (
          <button
            key={p.id}
            className={`sidebar__playlist${activePlaylistId === p.id ? ' active' : ''}`}
            onClick={() => onNav('playlists', p.id)}
          >
            <span className="sidebar__playlist-dot" aria-hidden="true" />
            <span className="sidebar__playlist-name">{p.name}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
