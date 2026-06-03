// Static seed catalogue for Audius. These are real Audius track ids captured
// from trending — they give the app something playable on first paint and let
// the test suite run without network. At runtime `loadCatalogue()` in the store
// fetches fresh trending + resolves SEED_ARTISTS for a richer, live catalogue.

import { streamUrl, colorFor } from '../api/audius'

const raw = [
  { id: 'E6bM2N', title: 'One Less Lonely Girl (BONNIE X CLYDE Remix)', artist: 'BONNIE X CLYDE', artwork: 'https://audius-creator-16.theblueprint.xyz/content/baeaaaiqsebwcsz44ogjz5tnx2w4gmblgozmazzrcvhsq5v4a25rekck3p2d2m/480x480.jpg', duration: 155000, genre: 'electronic', playCount: 1334 },
  { id: '31Jyo9q', title: 'RAIVA', artist: 'NAZAAR', artwork: 'https://audius-content-5.figment.io/content/baeaaaiqseah6oencrbearrwn47cyifknfg7atzeokfncykdlo6ohsqy5ex62c/480x480.jpg', duration: 164000, genre: 'trap', playCount: 755 },
  { id: 'dpb3Elm', title: 'Dont Be Shy', artist: 'Rixx, Mr Strings', artwork: 'https://cn1.mainnet.audiusindex.org/content/baeaaaiqsedxyehqxldgqcf7x2xbboycl6ggspfj6dyctkvtqytpfunb4gej2g/480x480.jpg', duration: 288000, genre: 'electronic', playCount: 309 },
  { id: 'r4NVNKO', title: 'Gucci purse', artist: 'Krxnic', artwork: 'https://cn1.shakespearetech.com/content/baeaaaiqseclra5ykajsoazmpbxofjtjfco7gugu4dkriejotqfmurql7nytdu/480x480.jpg', duration: 192000, genre: 'hip-hop/rap', playCount: 302 },
  { id: 'dloY13J', title: 'Sound System Check', artist: 'ohnoitsdoug x DISKADE', artwork: 'https://val007.open-audio-validator.com/content/baeaaaiqsea72nymfv57qy4ud3vifcunvbb7hwuyuxsby3e2bx2ctokgaq2a6a/480x480.jpg', duration: 192000, genre: 'dubstep', playCount: 224 },
  { id: 'lwaNJJK', title: 'FORTNITE EVERY NIGHT', artist: 'Ronnie Stelly', artwork: 'https://audius-02.staked.cloud/content/baeaaaiqsed64gqdp5oflmorg3foiticsuatb62v5fjqppyqohsznaqivf7e4m/480x480.jpg', duration: 156000, genre: 'hip-hop/rap', playCount: 176 },
  { id: '6EP3YzG', title: 'OUR EYES (original mix)', artist: 'BINAP', artwork: 'https://creatornode2.audius.co/content/baeaaaiqsecngqfa3f7un6emp3c4xt27zzvdmhhihph25rtlpypddbeig3wa2w/480x480.jpg', duration: 174000, genre: 'house', playCount: 265 },
  { id: 'lW4jPZZ', title: 'The Montauk', artist: 'Gramatik', artwork: 'https://val015.open-audio-validator.com/content/baeaaaiqsea3s5jrw5krna77o74r5m3iye6vovfukqh4yg4jnvn3r2l3azip44/480x480.jpg', duration: 338000, genre: 'glitch hop', playCount: 168 },
  { id: 'YbXja7', title: 'Instant Crush (Fattybass Remix)', artist: 'Fattybass', artwork: 'https://creatornode2.audius.co/content/baeaaaiqseaexu6cozcustnycaj7egwg762bjuipkrh5zhkmptbtfk5sqoqlii/480x480.jpg', duration: 289000, genre: 'tech house', playCount: 257 },
  { id: 'YVo9amr', title: 'Cash Contact Me', artist: 'KARAKAPLAN', artwork: 'https://val011.open-audio-validator.com/content/baeaaaiqseauh73oukvcc7mvuuah242uibtsp4kk4nwfniwsi5qmvdqxs5g3qq/480x480.jpg', duration: 100000, genre: 'hip-hop/rap', playCount: 171 },
]

function build(t) {
  return { ...t, streamUrl: streamUrl(t.id), color: colorFor(t.id), source: 'audius' }
}

export const SEED_TRACKS = raw.map(build)

// Artist / query terms resolved against Audius search at runtime to broaden the
// catalogue beyond trending (keeps a thread of the original rap curation).
export const SEED_ARTISTS = [
  'skriptonit', 'pharaoh', 'oxxxymiron', 'miyagi endshpil', 'big baby tape',
  'kizaru', 'morgenshtern', 'phonk', 'lofi hip hop', 'synthwave', 'kavinsky',
  'drum and bass', 'jungle', 'memphis phonk',
]

// Backwards-compatible exports (consumed by store/tests/views).
export const LIBRARY = SEED_TRACKS
export const ALL_TRACKS = SEED_TRACKS
export const CHARTS_RU = SEED_TRACKS
export const CHARTS_US = []
export const DISCOVER_TRACKS = SEED_TRACKS
