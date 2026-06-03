import './TopBar.css'

export default function TopBar({ searchQuery, onSearch }) {
  return (
    <header className="topbar">
      <div className="topbar__logo">
        <span className="topbar__logo-synth">SYNTH</span>
        <span className="topbar__logo-fm">.FM</span>
      </div>
      <input
        className="topbar__search"
        type="text"
        placeholder="⌕  SEARCH LIBRARY..."
        value={searchQuery}
        onChange={e => onSearch(e.target.value)}
      />
      <div className="topbar__avatar" aria-hidden="true" />
    </header>
  )
}
