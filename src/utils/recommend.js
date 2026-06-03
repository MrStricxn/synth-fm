// Local recommendation engine.
//
// Builds an affinity profile from the user's likes and completed listens, then
// scores every catalogue track by how well it matches that profile (artist,
// genre, region). Tracks the user already likes are excluded so the result
// surfaces fresh material. With no signal yet, falls back to popularity order.

function artistsOf(track) {
  return track.artist.split(',').map(a => a.trim().toLowerCase()).filter(Boolean)
}

export function buildProfile(liked, stats, catalog) {
  const artist = {}
  const genre = {}
  const region = {}
  const byId = Object.fromEntries(catalog.map(t => [t.id, t]))

  function bump(track, weight) {
    for (const a of artistsOf(track)) artist[a] = (artist[a] || 0) + weight
    if (track.genre) genre[track.genre] = (genre[track.genre] || 0) + weight
    if (track.region) region[track.region] = (region[track.region] || 0) + weight
  }

  // Likes are a strong explicit signal.
  for (const t of liked) bump(t, 3)
  // Completed listens are a strong implicit signal; plays a weaker one.
  for (const [id, s] of Object.entries(stats || {})) {
    const t = byId[id]
    if (!t) continue
    bump(t, (s.completed || 0) * 2 + (s.plays || 0) * 0.5)
  }

  return { artist, genre, region, hasSignal: liked.length > 0 || Object.keys(stats || {}).length > 0 }
}

export function recommend(catalog, liked, stats, limit = 12) {
  const profile = buildProfile(liked, stats, catalog)
  const likedIds = new Set(liked.map(t => t.id))

  if (!profile.hasSignal) {
    // Cold start — just show the catalogue (popularity order) minus nothing.
    return catalog.slice(0, limit)
  }

  const scored = catalog
    .filter(t => !likedIds.has(t.id))
    .map(t => {
      let score = 0
      for (const a of artistsOf(t)) score += (profile.artist[a] || 0) * 3
      score += (profile.genre[t.genre] || 0) * 1
      score += (profile.region[t.region] || 0) * 0.5
      return { track: t, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(x => x.track)
}
