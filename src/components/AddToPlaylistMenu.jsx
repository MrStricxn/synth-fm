import './AddToPlaylistMenu.css'
import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

export default function AddToPlaylistMenu({ track }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const playlists = usePlayerStore(s => s.playlists)

  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [open])

  function add(playlistId) {
    usePlayerStore.getState().addToPlaylist(playlistId, track)
    setOpen(false)
  }

  function createAndAdd() {
    const name = window.prompt('Название плейлиста:')
    if (!name?.trim()) return
    const store = usePlayerStore.getState()
    store.createPlaylist(name.trim())
    const created = usePlayerStore.getState().playlists.at(-1)
    if (created) store.addToPlaylist(created.id, track)
    setOpen(false)
  }

  return (
    <div className="atp" ref={rootRef}>
      <button
        className="atp__btn"
        aria-label="add to playlist"
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && (
        <div className="atp__menu" onClick={e => e.stopPropagation()}>
          <div className="atp__label">Добавить в плейлист</div>
          {playlists.length === 0 && <div className="atp__empty">Нет плейлистов</div>}
          {playlists.map(p => (
            <button key={p.id} className="atp__item" onClick={() => add(p.id)}>
              <span className="atp__dot" /> {p.name}
            </button>
          ))}
          <button className="atp__item atp__item--new" onClick={createAndAdd}>+ Новый плейлист</button>
        </div>
      )}
    </div>
  )
}
