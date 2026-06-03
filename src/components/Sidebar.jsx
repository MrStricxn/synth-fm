import './Sidebar.css'

const NAV_ITEMS = [
  { view: 'library',   icon: '◈', label: 'Library'   },
  { view: 'playlists', icon: '♫', label: 'Playlists'  },
  { view: 'discover',  icon: '⚡', label: 'Discover'  },
  { view: 'liked',     icon: '♥', label: 'Liked'      },
]

export default function Sidebar({ activeView, activePlaylistId, playlists, onNav, onNewPlaylist }) {
  return (
    <nav className="sidebar">
      {NAV_ITEMS.map(({ view, icon, label }) => (
        <button
          key={view}
          className={`sidebar__nav-item${activeView === view && !activePlaylistId ? ' active' : ''}`}
          onClick={() => onNav(view, null)}
        >
          <span>{icon}</span> {label}
        </button>
      ))}
      <div className="sidebar__divider" />
      <div className="sidebar__section-label">
        <span>My Lists</span>
        <button className="sidebar__new-playlist" aria-label="new playlist" onClick={onNewPlaylist}>+</button>
      </div>
      {playlists.map(p => (
        <button
          key={p.id}
          className={`sidebar__playlist${activePlaylistId === p.id ? ' active' : ''}`}
          onClick={() => onNav('playlists', p.id)}
        >
          <span style={{ opacity: 0.5 }}>▸</span> {p.name}
        </button>
      ))}
    </nav>
  )
}
