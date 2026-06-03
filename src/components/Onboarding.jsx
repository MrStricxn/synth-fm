import './Onboarding.css'
import { useState } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { AUDIUS_GENRES } from '../api/audius'

// First-run genre picker. The chosen genres are stored per-browser and seed the
// "Для тебя" recommendations, so each visitor gets a different starting feed.
export default function Onboarding() {
  const [picked, setPicked] = useState([])

  function toggle(g) {
    setPicked(p => (p.includes(g) ? p.filter(x => x !== g) : [...p, g]))
  }

  function finish(genres) {
    const store = usePlayerStore.getState()
    store.completeOnboarding(genres)
    store.loadRecommendations()
  }

  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <div className="onboarding__logo">SYNTH<span>.FM</span></div>
        <h1 className="onboarding__title">Что слушаем?</h1>
        <p className="onboarding__sub">Выбери пару жанров — соберём подборку под тебя. Это можно изменить позже.</p>

        <div className="onboarding__genres">
          {AUDIUS_GENRES.map(g => (
            <button
              key={g}
              className={`onboarding__chip${picked.includes(g) ? ' active' : ''}`}
              onClick={() => toggle(g)}
            >{g}</button>
          ))}
        </div>

        <div className="onboarding__actions">
          <button className="onboarding__skip" onClick={() => finish([])}>Пропустить</button>
          <button
            className="onboarding__go"
            disabled={picked.length === 0}
            onClick={() => finish(picked)}
          >
            Поехали{picked.length ? ` (${picked.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
