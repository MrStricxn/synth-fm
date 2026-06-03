// Каталог: русский и американский рэп. Ссылки — реальные permalink SoundCloud
// (приоритет официальным каналам). Обложки получены через публичный oEmbed.
// region: 'ru' | 'us', genre — для чартов и рекомендаций.

const RU = [
  { id: '1',  url: 'https://soundcloud.com/real_scrip/skriptonit-chistyy-ost-psikh-official-audio', title: 'Чистый (OST «Псих»)', artist: 'Скриптонит', artwork: 'https://i1.sndcdn.com/artworks-Cjg9OBdo4GBDiK8k-heyhBg-t500x500.jpg', color: 'linear-gradient(135deg, #9d4edd 0%, #e0509f 100%)', region: 'ru', genre: 'rap' },
  { id: '2',  url: 'https://soundcloud.com/huskymus/byt-orkom', title: 'Быть орком', artist: 'Хаски', artwork: 'https://i1.sndcdn.com/artworks-WVc7LTFamIHR-0-t500x500.jpg', color: 'linear-gradient(135deg, #232526 0%, #5b2a86 100%)', region: 'ru', genre: 'rap' },
  { id: '3',  url: 'https://soundcloud.com/kizaruhoodrich/big-baby-tape-x-kizaru-ride-or', title: 'Ride Or Die', artist: 'Big Baby Tape, kizaru', artwork: 'https://i1.sndcdn.com/artworks-dPEU5Z2oCFV5TTlE-cpEudw-t500x500.jpg', color: 'linear-gradient(135deg, #ff512f 0%, #dd2476 100%)', region: 'ru', genre: 'trap' },
  { id: '4',  url: 'https://soundcloud.com/tapeboss/konichiwa-feat-boulevard-2', title: 'Konichiwa (feat. Boulevard Depo)', artist: 'Big Baby Tape', artwork: 'https://i1.sndcdn.com/artworks-hoTg8gsNpXjYVtcB-Be8JhQ-t500x500.jpg', color: 'linear-gradient(135deg, #e0509f 0%, #ff7a59 100%)', region: 'ru', genre: 'trap' },
  { id: '5',  url: 'https://soundcloud.com/deaddynastyph/diko-naprimer', title: 'Дико, например', artist: 'PHARAOH', artwork: 'https://i1.sndcdn.com/artworks-000224711166-vwuim6-t500x500.jpg', color: 'linear-gradient(135deg, #0f0c29 0%, #9d4edd 100%)', region: 'ru', genre: 'cloud' },
  { id: '6',  url: 'https://soundcloud.com/cloudrap23/oxxxymiron-s-leta-ni-kupleta-ft-atl', title: 'С лета ни куплета (ft. ATL)', artist: 'Oxxxymiron', artwork: 'https://i1.sndcdn.com/artworks-000609403453-p4ka1y-t500x500.jpg', color: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)', region: 'ru', genre: 'rap' },
  { id: '7',  url: 'https://soundcloud.com/bro-458965659/big-baby-tape-kizaru-location', title: 'Location', artist: 'Big Baby Tape, kizaru', artwork: 'https://i1.sndcdn.com/artworks-0KayWmoqP7jykZNW-r7tIEw-t500x500.jpg', color: 'linear-gradient(135deg, #c31432 0%, #240b36 100%)', region: 'ru', genre: 'trap' },
  { id: '8',  url: 'https://soundcloud.com/sashkaminecraft/oxxxymiron-rap-city-mp3', title: 'Rap City', artist: 'Oxxxymiron', artwork: 'https://i1.sndcdn.com/artworks-000570473330-12gegt-t500x500.jpg', color: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)', region: 'ru', genre: 'rap' },
  { id: '9',  url: 'https://soundcloud.com/stepnext/pharaoh-mm-bonus-track-prod-by', title: 'ММ (Bonus Track)', artist: 'PHARAOH', artwork: 'https://i1.sndcdn.com/artworks-000442745400-zd8pb5-t500x500.jpg', color: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)', region: 'ru', genre: 'cloud' },
  { id: '10', url: 'https://soundcloud.com/cloudrussia/boulevard-depo-feat-big-baby-tape-i61-offmi-baters-esquire-cypher', title: 'Esquire Cypher', artist: 'Boulevard Depo, Big Baby Tape, i61', artwork: 'https://i1.sndcdn.com/artworks-000580010636-5t33dq-t500x500.jpg', color: 'linear-gradient(135deg, #ff7a59 0%, #e0509f 100%)', region: 'ru', genre: 'trap' },
  { id: 'd1', url: 'https://soundcloud.com/bigbabytape-djtape/dead-heat-feat-boulevard-depo', title: 'Dead Heat (feat. Boulevard Depo)', artist: 'Big Baby Tape', artwork: 'https://i1.sndcdn.com/artworks-000355053747-thzctb-t500x500.jpg', color: 'linear-gradient(135deg, #870000 0%, #190a05 100%)', region: 'ru', genre: 'trap' },
  { id: 'd2', url: 'https://soundcloud.com/offmi/ekipazh-feat-haski-bollywoodfm', title: 'Экипаж (feat. Хаски, bollywoodFM)', artist: 'OFFMi', artwork: 'https://i1.sndcdn.com/artworks-28FJPXNL2tEe-0-t500x500.jpg', color: 'linear-gradient(135deg, #41295a 0%, #2f0743 100%)', region: 'ru', genre: 'cloud' },
  { id: 'd3', url: 'https://soundcloud.com/deaddynastyph/03-5-prod-by-saluki-bryte', title: '5 Минут Назад', artist: 'PHARAOH', artwork: 'https://i1.sndcdn.com/artworks-000148359356-dy6aej-t500x500.jpg', color: 'linear-gradient(135deg, #36096d 0%, #37d5d6 100%)', region: 'ru', genre: 'cloud' },
  { id: 'd4', url: 'https://soundcloud.com/8dhkdlhnyvov/oxxxymiron-x-atl-x-igla-gryaz', title: 'Грязь', artist: 'Oxxxymiron, ATL', artwork: 'https://i1.sndcdn.com/artworks-Tnt7P0iyDMdXJpkZ-UY2wxQ-t500x500.jpg', color: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)', region: 'ru', genre: 'rap' },
  { id: 'd5', url: 'https://soundcloud.com/lehleh/skriptonit-vecherinka-lehay-remix', title: 'Вечеринка (Lehay Remix)', artist: 'Скриптонит', artwork: 'https://i1.sndcdn.com/artworks-000352605198-xttkap-t500x500.jpg', color: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)', region: 'ru', genre: 'rap' },
  { id: 'r1', url: 'https://soundcloud.com/jahkhalib/leyla-pri-uch-makvin', title: 'Лейла (при уч. Маквин)', artist: 'Jah Khalib', artwork: 'https://i1.sndcdn.com/artworks-000185861527-td9vz3-t500x500.jpg', color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', region: 'ru', genre: 'rap' },
  { id: 'r2', url: 'https://soundcloud.com/soda-luv/sayfer-ft-og-buda-egor-krid-mayot', title: 'Сайфер (ft. OG Buda, Егор Крид, MAYOT)', artist: 'SODA LUV', artwork: 'https://i1.sndcdn.com/artworks-riJleZfcvJQRwRon-HVEulQ-t500x500.jpg', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', region: 'ru', genre: 'trap' },
]

const US = [
  { id: 'u1', url: 'https://soundcloud.com/jahseh-onfroy/moonlight', title: 'Moonlight', artist: 'XXXTENTACION', artwork: 'https://i1.sndcdn.com/artworks-IFW1N06SNp92-0-t500x500.jpg', color: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)', region: 'us', genre: 'emo-rap' },
  { id: 'u2', url: 'https://soundcloud.com/uiceheidd/lucid-dreams-forget-me', title: 'Lucid Dreams', artist: 'Juice WRLD', artwork: 'https://i1.sndcdn.com/artworks-nwaD1XhrbqAP-0-t500x500.jpg', color: 'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)', region: 'us', genre: 'emo-rap' },
  { id: 'u3', url: 'https://soundcloud.com/lil_peep/star-shopping', title: 'Star Shopping', artist: 'Lil Peep', artwork: 'https://i1.sndcdn.com/artworks-YSm9jt5RjzHX-0-t500x500.jpg', color: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)', region: 'us', genre: 'emo-rap' },
  { id: 'u4', url: 'https://soundcloud.com/lil_peep/beamerboy-prod-nedarb-nagrom', title: 'beamerboy', artist: 'Lil Peep', artwork: 'https://i1.sndcdn.com/artworks-000150031237-l3abd6-t500x500.jpg', color: 'linear-gradient(135deg, #42275a 0%, #734b6d 100%)', region: 'us', genre: 'emo-rap' },
]

// ── IC3PEAK ──────────────────────────────────────────────────────────────────
const IC3PEAK = [
  { id: 'ic1', url: 'https://soundcloud.com/ic3peak/b0ipmfkmmvfz', title: 'Плак-Плак', artist: 'IC3PEAK', artwork: 'https://i1.sndcdn.com/artworks-mXKlWRWQgRo7-0-t500x500.jpg', color: 'linear-gradient(135deg, #0a0a0a 0%, #8b0000 100%)', region: 'ru', genre: 'alt' },
  { id: 'ic2', url: 'https://soundcloud.com/ic3peak/sbn', title: 'Смерти Больше Нет', artist: 'IC3PEAK', artwork: 'https://i1.sndcdn.com/artworks-000412980930-2gtat9-t500x500.jpg', color: 'linear-gradient(135deg, #111 0%, #c0392b 100%)', region: 'ru', genre: 'alt' },
]

// ── Аигел ────────────────────────────────────────────────────────────────────
const AIGEL = [
  { id: 'ai1', url: 'https://soundcloud.com/aigel-678380266/pyyala-3', title: 'Пыяла', artist: 'Аигел', artwork: 'https://i1.sndcdn.com/artworks-pKKYcjZIWKC2gcOT-BfBGew-t500x500.jpg', color: 'linear-gradient(135deg, #2d1b69 0%, #e67e22 100%)', region: 'ru', genre: 'alt' },
  { id: 'ai2', url: 'https://soundcloud.com/aigel-678380266/tatarin', title: 'Татарин', artist: 'Аигел', artwork: 'https://i1.sndcdn.com/artworks-C2cKt7s360BccQPd-Iq1TsQ-t500x500.jpg', color: 'linear-gradient(135deg, #1a1a2e 0%, #c0392b 100%)', region: 'ru', genre: 'alt' },
]

// ── FACE ─────────────────────────────────────────────────────────────────────
const FACE_TRACKS = [
  { id: 'fa1', url: 'https://soundcloud.com/facepublicenemy/yumorist', title: 'Юморист', artist: 'FACE', artwork: 'https://i1.sndcdn.com/artworks-000487373763-1plggs-t500x500.jpg', color: 'linear-gradient(135deg, #e94560 0%, #0f3460 100%)', region: 'ru', genre: 'rap' },
]

// ── Jah Khalib (новые) ───────────────────────────────────────────────────────
const JAH_EXTRA = [
  { id: 'jk2', url: 'https://soundcloud.com/jahkhalib/medina', title: 'Медина', artist: 'Jah Khalib', artwork: 'https://i1.sndcdn.com/artworks-eNXQitKJNqF7-0-t500x500.jpg', color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', region: 'ru', genre: 'rap' },
]

// ── Miyagi & Эндшпиль ────────────────────────────────────────────────────────
const MIYAGI = [
  { id: 'my1', url: 'https://soundcloud.com/miyagi_black/i-got-love-feat-rem-digga', title: 'I Got Love (feat. Рем Дигга)', artist: 'Miyagi & Эндшпиль', artwork: 'https://i1.sndcdn.com/artworks-6D1PbPALmC1TLbv6-bTwZ7g-t500x500.jpg', color: 'linear-gradient(135deg, #1a1a2e 0%, #3a3a5e 100%)', region: 'ru', genre: 'rap' },
  { id: 'my2', url: 'https://soundcloud.com/miyagi_black/patron', title: 'Патрон', artist: 'Miyagi & Эндшпиль', artwork: 'https://i1.sndcdn.com/artworks-A7MY9sLbDSyYvVOT-WE4z1w-t500x500.jpg', color: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', region: 'ru', genre: 'rap' },
]

// ── Big Baby Tape (новые) ────────────────────────────────────────────────────
const BBT_EXTRA = [
  { id: 'bbt4', url: 'https://soundcloud.com/tapeboss/gimme-loot', title: 'Gimme The Loot', artist: 'Big Baby Tape', artwork: 'https://i1.sndcdn.com/artworks-hoTg8gsNpXjYVtcB-Be8JhQ-t500x500.jpg', color: 'linear-gradient(135deg, #870000 0%, #190a05 100%)', region: 'ru', genre: 'trap' },
  { id: 'bbt5', url: 'https://soundcloud.com/tapeboss/dragonborn-1', title: 'Dragonborn', artist: 'Big Baby Tape', artwork: 'https://i1.sndcdn.com/artworks-hoTg8gsNpXjYVtcB-Be8JhQ-t500x500.jpg', color: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', region: 'ru', genre: 'trap' },
]

// ── PHARAOH (новые) ──────────────────────────────────────────────────────────
const PHARAOH_EXTRA = [
  { id: 'ph2', url: 'https://soundcloud.com/deaddynastyph/omertvenie', title: 'Омертвение', artist: 'PHARAOH', artwork: 'https://i1.sndcdn.com/artworks-xV0dazLAun3WKObE-HPy9wg-t500x500.jpg', color: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)', region: 'ru', genre: 'cloud' },
  { id: 'ph3', url: 'https://soundcloud.com/deaddynastyph/na-lune-prod-white-punk', title: 'На Луне', artist: 'PHARAOH', artwork: 'https://i1.sndcdn.com/artworks-000355874625-u00fas-t500x500.jpg', color: 'linear-gradient(135deg, #1a1a2e 0%, #6a3093 100%)', region: 'ru', genre: 'cloud' },
]

// ── Oxxxymiron (новые) ───────────────────────────────────────────────────────
const OXY_EXTRA = [
  { id: 'ox2', url: 'https://soundcloud.com/oxxxymiron/ultima-thule', title: 'Ultima Thule (feat. Луперкаль)', artist: 'Oxxxymiron', artwork: 'https://i1.sndcdn.com/artworks-3UDLReB4iO7D-0-t500x500.jpg', color: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)', region: 'ru', genre: 'rap' },
  { id: 'ox3', url: 'https://soundcloud.com/oxxxymiron/8r25a8jclyik', title: 'Где нас нет', artist: 'Oxxxymiron', artwork: 'https://i1.sndcdn.com/artworks-p54iFK8TT11q-0-t500x500.jpg', color: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)', region: 'ru', genre: 'rap' },
]

// ── T-FEST ───────────────────────────────────────────────────────────────────
const TFEST = [
  { id: 'tf1', url: 'https://soundcloud.com/tfest/inostranec', title: 'Иностранец', artist: 'T-FEST', artwork: 'https://i1.sndcdn.com/artworks-ny03ed2kgXbhOWtz-apoQnA-t500x500.jpg', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', region: 'ru', genre: 'rap' },
  { id: 'tf2', url: 'https://soundcloud.com/tfest/iz-evropy', title: 'Из Европы', artist: 'T-FEST', artwork: 'https://i1.sndcdn.com/artworks-EtP9cvNx9Q9r-0-t500x500.jpg', color: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', region: 'ru', genre: 'rap' },
]

// ── MORGENSHTERN ─────────────────────────────────────────────────────────────
const MORGAN = [
  { id: 'mg1', url: 'https://soundcloud.com/morgenshtern-official/antidepressanty', title: 'Антидепрессанты', artist: 'MORGENSHTERN', artwork: 'https://i1.sndcdn.com/artworks-QOuOZe3fNaiI-0-t500x500.jpg', color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', region: 'ru', genre: 'trap' },
  { id: 'mg2', url: 'https://soundcloud.com/morgenshtern-official/povod', title: 'Повод', artist: 'MORGENSHTERN', artwork: 'https://i1.sndcdn.com/artworks-SceYyuz3DQDj-0-t500x500.jpg', color: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)', region: 'ru', genre: 'trap' },
]

// ── OG Buda ──────────────────────────────────────────────────────────────────
const OG_BUDA = [
  { id: 'og1', url: 'https://soundcloud.com/ogbuda/vydox-feat-163onmyneck-yanix', title: 'Выдох (feat. 163ONMYNECK, Yanix)', artist: 'OG Buda', artwork: 'https://i1.sndcdn.com/artworks-Rjq9bCzfFUui-0-t500x500.jpg', color: 'linear-gradient(135deg, #1a1a1a 0%, #2d5016 100%)', region: 'ru', genre: 'drill' },
]

// ── Элджей ───────────────────────────────────────────────────────────────────
const ALLJ = [
  { id: 'el1', url: 'https://soundcloud.com/sayonarasickboy/rozovoe-vino-feat-feduk', title: 'Розовое вино (feat. FEDUK)', artist: 'Элджей', artwork: 'https://i1.sndcdn.com/artworks-mUFBCacY6GgcRhPK-WdDuyA-t500x500.jpg', color: 'linear-gradient(135deg, #e91e8c 0%, #ff6ca1 100%)', region: 'ru', genre: 'trap' },
]

// ── GONE.Fludd ───────────────────────────────────────────────────────────────
const GONE_FLUDD = [
  { id: 'gf1', url: 'https://soundcloud.com/gonexfludd/gonefludd-vudu', title: 'ВУДУ', artist: 'GONE.Fludd', artwork: '', color: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)', region: 'ru', genre: 'trap' },
  { id: 'gf2', url: 'https://soundcloud.com/gonexfludd/gonefludd-kubik-ljda', title: 'КУБИК ЛЬДА', artist: 'GONE.Fludd', artwork: '', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', region: 'ru', genre: 'trap' },
  { id: 'gf3', url: 'https://soundcloud.com/gonexfludd/gonefludd-litup', title: 'LITUP', artist: 'GONE.Fludd', artwork: '', color: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)', region: 'ru', genre: 'trap' },
]

// ── Скриптонит (новые) ───────────────────────────────────────────────────────
const SKRIP_EXTRA = [
  { id: 'sk2', url: 'https://soundcloud.com/real_scrip/3v1tadvmfrpy', title: 'Положение', artist: 'Скриптонит', artwork: 'https://i1.sndcdn.com/artworks-3WRz5PWVVl66vjMP-O6Ryyw-t500x500.jpg', color: 'linear-gradient(135deg, #9d4edd 0%, #e0509f 100%)', region: 'ru', genre: 'rap' },
  { id: 'sk3', url: 'https://soundcloud.com/real_scrip/rodilsya-i-vyros', title: 'Родился И Вырос', artist: 'Скриптонит', artwork: 'https://i1.sndcdn.com/artworks-hwCZIRoOTDvcG0ZI-9OTcAw-t500x500.jpg', color: 'linear-gradient(135deg, #3d0c02 0%, #c44b4b 100%)', region: 'ru', genre: 'rap' },
  { id: 'sk4', url: 'https://soundcloud.com/real_scrip/fxmu33gs7r3w', title: 'Пацан', artist: 'Скриптонит', artwork: 'https://i1.sndcdn.com/artworks-3WRz5PWVVl66vjMP-O6Ryyw-t500x500.jpg', color: 'linear-gradient(135deg, #200122 0%, #9d4edd 100%)', region: 'ru', genre: 'rap' },
]

export const ALL_TRACKS = [
  ...RU,
  ...SKRIP_EXTRA, ...JAH_EXTRA, ...IC3PEAK, ...AIGEL,
  ...FACE_TRACKS, ...MIYAGI, ...TFEST, ...BBT_EXTRA,
  ...PHARAOH_EXTRA, ...OXY_EXTRA, ...MORGAN, ...OG_BUDA,
  ...ALLJ, ...GONE_FLUDD,
  ...US,
]
export const LIBRARY = ALL_TRACKS
export const CHARTS_RU = [...RU, ...SKRIP_EXTRA, ...JAH_EXTRA, ...IC3PEAK, ...AIGEL, ...FACE_TRACKS, ...MIYAGI, ...TFEST, ...BBT_EXTRA, ...PHARAOH_EXTRA, ...OXY_EXTRA, ...MORGAN, ...OG_BUDA, ...ALLJ, ...GONE_FLUDD]
export const CHARTS_US = US
// Сохраняем экспорт для совместимости (используется как запасной список).
export const DISCOVER_TRACKS = US
