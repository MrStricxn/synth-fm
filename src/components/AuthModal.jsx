import './AuthModal.css'
import { useState } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

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

  return (
    <div className="auth" onClick={onClose}>
      <div className="auth__card" onClick={e => e.stopPropagation()}>
        <button className="auth__close" aria-label="close" onClick={onClose}>✕</button>
        <h2 className="auth__title">{mode === 'signup' ? 'Регистрация' : 'Вход'}</h2>
        <p className="auth__sub">Синхронизируй лайки и плейлисты между устройствами.</p>

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
