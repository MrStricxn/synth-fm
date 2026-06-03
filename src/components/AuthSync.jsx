import { useEffect } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

// Headless: boots Supabase auth on mount and pushes library changes to the
// cloud (debounced) whenever the signed-in user's liked / playlists / genres
// change. No-op in guest mode.
export default function AuthSync() {
  useEffect(() => {
    usePlayerStore.getState().initAuth()
    const unsub = usePlayerStore.subscribe((state, prev) => {
      if (!state.user) return
      if (
        state.liked !== prev.liked ||
        state.playlists !== prev.playlists ||
        state.genres !== prev.genres
      ) {
        usePlayerStore.getState().pushCloud()
      }
    })
    return unsub
  }, [])
  return null
}
