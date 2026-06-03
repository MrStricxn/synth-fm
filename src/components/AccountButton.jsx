import './AccountButton.css'
import { useState, useRef, useEffect } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { isAuthConfigured } from '../api/supabase'
import AuthModal from './AuthModal'

export default function AccountButton() {
  const user = usePlayerStore(s => s.user)
  const [modal, setModal] = useState(false)
  const [menu, setMenu] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!menu) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenu(false) }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [menu])

  // Auth not configured yet → keep the original decorative avatar.
  if (!isAuthConfigured) return <div className="topbar__avatar" aria-hidden="true">S</div>

  if (!user) {
    return (
      <>
        <button className="account__login" onClick={() => setModal(true)}>Войти</button>
        {modal && <AuthModal onClose={() => setModal(false)} />}
      </>
    )
  }

  const email = user.email || ''
  const initial = (email[0] || 'U').toUpperCase()

  return (
    <div className="account" ref={ref}>
      <button className="topbar__avatar account__avatar" onClick={() => setMenu(m => !m)} aria-label="account">
        {initial}
      </button>
      {menu && (
        <div className="account__menu">
          <div className="account__email">{email}</div>
          <div className="account__synced">☁ Синхронизировано</div>
          <button className="account__signout" onClick={() => { usePlayerStore.getState().signOut(); setMenu(false) }}>
            Выйти
          </button>
        </div>
      )}
    </div>
  )
}
