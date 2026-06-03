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
      </div>
      <div className="topbar__avatar" aria-hidden="true">S</div>
    </header>
  )
}
