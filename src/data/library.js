// Static seed catalogue (Yandex). Real chart track ids captured 2026-06-05 (kz
// region) so the app paints instantly and the test suite runs offline. At
// runtime `loadCatalogue()` fetches the live chart + resolves SEED_ARTISTS.
import { colorFor } from '../api/colors'

function cover(uri, size = '400x400') {
  return uri ? `https://${uri.replace('%%', size)}` : ''
}

const rawYa = [
  { id: '151020719', title: 'Шадэ', artist: 'By Индия', cover: 'avatars.yandex.net/get-music-content/16154377/525b9915.a.41920857-2/%%', dur: 168940 },
  { id: '150053393', title: 'Мальборо', artist: 'SAYAN', cover: 'avatars.yandex.net/get-music-content/19999910/9afd1da4.a.41489388-1/%%', dur: 122720 },
  { id: '151136140', title: 'ЭКСПОНАТ', artist: 'MIA BOYKA', cover: 'avatars.yandex.net/get-music-content/20372582/82527af1.a.41976933-2/%%', dur: 98760 },
  { id: '151724864', title: 'Біз жолығамыз', artist: 'Abzal Uteshov', cover: 'avatars.yandex.net/get-music-content/19035207/af7ffaa4.a.42228159-1/%%', dur: 176300 },
  { id: '150372866', title: 'Махаббатым - Qazaq Edition', artist: 'baqzhvn', cover: 'avatars.yandex.net/get-music-content/16450533/5aaede59.a.41636053-1/%%', dur: 230010 },
  { id: '151092654', title: 'Sagynysh', artist: 'Sadraddin', cover: 'avatars.yandex.net/get-music-content/16154377/e8523e30.a.41958888-1/%%', dur: 165920 },
  { id: '150056922', title: 'Ademi', artist: 'Kalifarniya', cover: 'avatars.yandex.net/get-music-content/17696724/947e24b2.a.41491054-1/%%', dur: 228000 },
  { id: '147654214', title: 'ВАТ ИЗ ЛАВ', artist: 'Junior', cover: 'avatars.yandex.net/get-music-content/17740720/97c3f996.a.40416390-1/%%', dur: 145800 },
]

export const SEED_TRACKS = rawYa.map(t => ({
  id: `ya_${t.id}`,
  trackId: t.id,
  title: t.title,
  artist: t.artist,
  artwork: cover(t.cover),
  streamUrl: '',
  duration: t.dur,
  genre: '',
  playCount: 0,
  color: colorFor(`ya_${t.id}`),
  source: 'yandex',
}))

// Artist / query terms resolved against Yandex search at runtime to broaden the
// catalogue beyond the chart.
export const SEED_ARTISTS = [
  'oxxxymiron', 'miyagi andy panda', 'pharaoh', 'skriptonit', 'big baby tape',
  'kizaru', 'basta', 'morgenshtern', 'jah khalib', 'noize mc', 'face',
  'obladaet', 'og buda', 't-fest', 'gone fludd', 'mayot', 'soda luv',
  'platina', 'boulevard depo', 'seemee', 'kavinsky', 'synthwave', 'phonk',
]

// Genre chips for onboarding + recommendation seeds (used as Yandex search terms).
export const GENRES = [
  'Synthwave', 'Phonk', 'Hip-Hop', 'Electronic', 'Lo-Fi',
  'House', 'Drum & Bass', 'Pop', 'Rock', 'R&B',
]

// Backwards-compatible exports (consumed by store/tests/views).
export const LIBRARY = SEED_TRACKS
export const ALL_TRACKS = SEED_TRACKS
export const CHARTS_RU = SEED_TRACKS
export const CHARTS_US = []
export const DISCOVER_TRACKS = SEED_TRACKS
