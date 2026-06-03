import './AuthModal.css'
import { useState } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

const Providers = {
  google: <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#fff" d="M12 11v2.8h4c-.2 1-1.3 3-4 3a4.5 4.5 0 0 1 0-9c1.3 0 2.2.5 2.7 1l2-1.9A7.5 7.5 0 1 0 12 19.5c4.3 0 7.2-3 7.2-7.3 0-.5 0-.8-.1-1.2H12Z"/></svg>,
  discord: <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a13 13 0 0 1 3.6 1.6 12 12 0 0 0-10.8 0A13 13 0 0 1 11.2 4.4L11 4a17 17 0 0 0-4.3 1.3C3.9 9.5 3.1 13.6 3.5 17.6a17 17 0 0 0 5.2 2.6l.6-1a11 11 0 0 1-1.8-.9l.4-.3a8.6 8.6 0 0 0 7.4 0l.4.3c-.5.4-1.2.7-1.8.9l.6 1a17 17 0 0 0 5.2-2.6c.5-4.6-.8-8.7-2.4-12.3ZM9.7 15.2c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Zm4.6 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Z"/></svg>,
}

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setInfo(''); setBusy(true)
    const store = usePlayerStore.getState()
    const fn = mode === 'signup' ? store.signUpEmail : store.signInEmail
    const { error } = await fn(email.trim(), password)
    setBusy(false)
    if (error) { setError(error); return }
    if (mode === 'signup') setInfo('Проверь почту для подтверждения, затем войди.')
    else onClose()
  }

  async function oauth(provider) {
    setError('')
    const { error } = await usePlayerStore.getState().signInOAuth(provider)
    if (error) setError(error)
    // On success the browser redirects to the provider.
  }

  return (
    <div className="auth" onClick={onClose}>
      <div className="auth__card" onClick={e => e.stopPropagation()}>
        <button className="auth__close" aria-label="close" onClick={onClose}>✕</button>
        <h2 className="auth__title">{mode === 'signup' ? 'Регистрация' : 'Вход'}</h2>
        <p className="auth__sub">Синхронизируй лайки и плейлисты между устройствами.</p>

        <div className="auth__oauth">
          <button className="auth__provider auth__provider--google" onClick={() => oauth('google')}>
            {Providers.google} Google
          </button>
          <button className="auth__provider auth__provider--discord" onClick={() => oauth('discord')}>
            {Providers.discord} Discord
          </button>
        </div>

        <div className="auth__divider"><span>или по почте</span></div>

        <form className="auth__form" onSubmit={submit}>
          <input className="auth__input" type="email" placeholder="Email" required
            value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          <input className="auth__input" type="password" placeholder="Пароль" required minLength={6}
            value={password} onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />

          {error && <div className="auth__error">{error}</div>}
          {info && <div className="auth__info">{info}</div>}

          <button className="auth__submit" type="submit" disabled={busy}>
            {busy ? '…' : mode === 'signup' ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        <div className="auth__switch">
          {mode === 'signup' ? (
            <>Уже есть аккаунт? <button onClick={() => { setMode('signin'); setError('') }}>Войти</button></>
          ) : (
            <>Нет аккаунта? <button onClick={() => { setMode('signup'); setError('') }}>Регистрация</button></>
          )}
        </div>
      </div>
    </div>
  )
}
