import './TopBar.css'

export default function TopBar({ searchQuery, onSearch }) {
  return (
    <header className="topbar">
      <div className="topbar__logo">
        <span className="topbar__logo-mark" aria-hidden="true" />
        <span className="topbar__logo-text">
          <span className="topbar__logo-synth">SYNTH</span><span className="topbar__logo-fm">.FM</span>
        </span>
      </div>
      <div className="topbar__search">
        <span className="topbar__search-icon" aria-hidden="true">⌕</span>
        <input
          className="topbar__search-input"
          type="text"
          placeholder="Трек, исполнитель или подборка"
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
        />
        {searchQuery && (
          <button className="topbar__search-clear" aria-label="clear search" onClick={() => onSearch('')}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        )}
      </div>
      <div className="topbar__avatar" aria-hidden="true">S</div>
    </header>
  )
}
