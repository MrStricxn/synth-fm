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
]

const US = [
  { id: 'u1', url: 'https://soundcloud.com/jahseh-onfroy/moonlight', title: 'Moonlight', artist: 'XXXTENTACION', artwork: 'https://i1.sndcdn.com/artworks-IFW1N06SNp92-0-t500x500.jpg', color: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)', region: 'us', genre: 'emo-rap' },
  { id: 'u2', url: 'https://soundcloud.com/uiceheidd/lucid-dreams-forget-me', title: 'Lucid Dreams', artist: 'Juice WRLD', artwork: 'https://i1.sndcdn.com/artworks-nwaD1XhrbqAP-0-t500x500.jpg', color: 'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)', region: 'us', genre: 'emo-rap' },
  { id: 'u3', url: 'https://soundcloud.com/lil_peep/star-shopping', title: 'Star Shopping', artist: 'Lil Peep', artwork: 'https://i1.sndcdn.com/artworks-YSm9jt5RjzHX-0-t500x500.jpg', color: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)', region: 'us', genre: 'emo-rap' },
  { id: 'u4', url: 'https://soundcloud.com/lil_peep/beamerboy-prod-nedarb-nagrom', title: 'beamerboy', artist: 'Lil Peep', artwork: 'https://i1.sndcdn.com/artworks-000150031237-l3abd6-t500x500.jpg', color: 'linear-gradient(135deg, #42275a 0%, #734b6d 100%)', region: 'us', genre: 'emo-rap' },
]

export const ALL_TRACKS = [...RU, ...US]
export const LIBRARY = ALL_TRACKS
export const CHARTS_RU = RU
export const CHARTS_US = US
// Сохраняем экспорт для совместимости (используется как запасной список).
export const DISCOVER_TRACKS = US
