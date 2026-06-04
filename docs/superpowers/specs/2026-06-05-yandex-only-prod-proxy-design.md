# Yandex-only + production serverless proxy

**Дата:** 2026-06-05
**Статус:** утверждён, готов к плану реализации
**Заменяет:** `2026-06-05-yandex-music-source-design.md` (фаза 1 — флаг + локальный прокси). Теперь делаем Яндекс **единственным** источником и поднимаем прод-прокси на Vercel.

## Цель

1. Сделать Яндекс.Музыку единственным источником: **полностью удалить** Audius и hearthis.
2. Поднять Яндекс в публичном проде (Vercel) через serverless-функцию, которая держит токен на сервере (не в бандле) и ограничивает абуз.

## Решения пользователя (зафиксированы в брейнсторме)

- Прод **публичный**, модель токена — **общий токен владельца** (вариант B). Риск рейтлимита/бана аккаунта владельца **принят осознанно** (предупреждён). Митигации обязательны, но риск не убирают.
- Стартовый сид — **бакнуть ~8 реальных треков чарта** Яндекса (для мгновенной отрисовки + офлайн-тестов).

## Часть A. Удаление Audius/hearthis (Яндекс-only)

Текущие связи (не считая тестов): `Onboarding.jsx` (`AUDIUS_GENRES`), `src/data/library.js` (`streamUrl`,`colorFor`,`SEED_TRACKS`), `usePlayerStore.js` (audius+hearthis+yandex). `yandex.js` тоже импортит `colorFor` из `audius.js`. Тест `App.integration.test.jsx` мокает `../api/audius`.

Изменения:

1. **`src/api/colors.js` (новый).** Перенести `colorFor` (PALETTE + хеш) сюда из `audius.js`. Обновить импорт в `yandex.js` (`./colors`) и в `library.js`.
2. **Удалить** `src/api/audius.js` и `src/api/hearthis.js`.
3. **`src/data/library.js`:**
   - Убрать импорт из `audius`; брать `colorFor` из `./colors` (через api путь `../api/colors`).
   - `SEED_TRACKS` — заменить Audius-треки на 8 статичных Яндекс-треков (реальные id чарта, регион kz), форма как у `normalizeTrack`: `{ id:'ya_<id>', trackId:'<id>', title, artist, artwork(400x400), streamUrl:'', duration(ms), genre:'', playCount:0, color: colorFor('ya_<id>'), source:'yandex' }`. Играются через ленивый резолв.
   - `SEED_ARTISTS` — оставить (поисковые сиды для Яндекса). `CIS_ARTISTS` — слить в `SEED_ARTISTS` (источников больше не два) либо оставить и использовать вместе; финально храним **один** список `SEED_ARTISTS`.
   - Добавить `export const GENRES` — нейтральный список жанров для онбординга/рекомендаций (synthwave, phonk, hip-hop, electronic, lo-fi, house, drum & bass, pop, rock, r&b).
4. **`src/components/Onboarding.jsx`:** импорт `AUDIUS_GENRES` → `GENRES` из `../data/library`.
5. **`src/store/usePlayerStore.js`:** удалить импорты audius/hearthis и флаг `SOURCE`/ветки `else`. `loadCatalogue` = `trendingTracks` + `resolveSeed(SEED_ARTISTS)`. `setSearchQuery` = `yandex.searchTracks`. `loadRecommendations` = `yandex.searchTracks` по топ-артистам + жанрам (как поисковым терминам), холодный старт → `trendingTracks`.
6. **Тесты:** `App.integration.test.jsx` и любые, что мокали `../api/audius`/полагались на `source:'audius'`, перевести на мок `../api/yandex`. `SEED_TRACKS` держать непустым (контракт initial state). Существующие 78 должны остаться зелёными после правок.

## Часть B. Прод-прокси на Vercel

**Единый контракт прокси — query-параметр.** Клиент шлёт `${PROXY}?url=<encodeURIComponent(target)>` (вместо `${PROXY}/<target>`), потому что `https://` в пути на Vercel схлопывается. На этот контракт переводим **оба** прокси и клиент.

1. **`api/proxy.js` (новый, Vercel serverless, ESM `export default`):**
   - Читает `YANDEX_TOKEN` из `process.env` (серверный секрет, **не** `VITE_`).
   - Берёт цель из `req.query.url`; **инжектит** `Authorization: OAuth ${YANDEX_TOKEN}` (клиентский Authorization игнорируется) → токена в бандле нет.
   - **Allowlist хостов:** `api.music.yandex.net`, либо хост заканчивается на `.storage.yandex.net`, либо `storage.mds.yandex.net`. **Allowlist путей (api host):** начинается с `/search`, `/landing3/chart`, либо матчит `^/tracks/\d+/download-info`. **storage host:** путь содержит `/download-info`. Иначе — `403`.
   - Только `GET`/`OPTIONS`. На `OPTIONS` — 204 + CORS.
   - Срезает `origin`,`referer`,`connection`,`host` (ставит host цели); чистит все upstream `access-control-*`; ставит один CORS-набор (как `buildResponseHeaders` локального прокси).
   - **Кэш:** на `/search` и `/landing3/chart` — `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`; на `download-info` — `Cache-Control: no-store`.
   - Ошибка апстрима → `502`.
   - Экспорт хелперов `isAllowed(urlString)` и `buildResponseHeaders(upstreamHeaders)` для юнит-тестов (через `export`).
2. **`server/cors-proxy.cjs` (локальный):** перевести разбор цели с `req.url.slice(1)` на `?url=`. Остальное (strip Origin/Referer, `buildResponseHeaders`) без изменений. Локальный прокси токен НЕ инжектит — клиент шлёт свой из `.env.local` (dev-only).
3. **`src/api/yandex.js`:** `apiGet` и второй fetch в `getStreamUrl` строят URL как `${PROXY}?url=${encodeURIComponent(target)}`. `Authorization` клиент по-прежнему прикрепляет из `VITE_YANDEX_TOKEN` (в проде пусто — функция инжектит свой; локально — реальный).
4. **Дефолты окружения:**
   - Дефолт `VITE_YANDEX_PROXY` меняем на `/api/proxy` (прод). `.env.local` оставляет `http://localhost:8080`.
   - `VITE_PLAYER_SOURCE`/флаг `SOURCE` удаляются (источник всегда Яндекс).
   - `.env.example` обновить: убрать `VITE_PLAYER_SOURCE`, пояснить `VITE_YANDEX_PROXY` (локально localhost, в проде `/api/proxy`), добавить заметку про серверный `YANDEX_TOKEN` в Vercel.
5. **Маршрутизация Vercel:** убедиться, что SPA-rewrite (если есть `vercel.json`) не перехватывает `/api/*`. Если файла нет — Vercel сам отдаёт `api/*` как функции и `dist` как статику; добавить `vercel.json` только если SPA-фолбэк ломает `/api`.
6. **Стрим:** финальный mp3 играется `<audio>` напрямую из хранилища Яндекса (без прокси, без токена, CORS не нужен) — без изменений.

## Часть C. Действия пользователя в Vercel (вне кода)

В Vercel → Project → Settings → Environment Variables добавить `YANDEX_TOKEN=<токен>` (Production, можно Preview). Инструкция — в плане. Я доступа к дашборду не имею.

## Обработка ошибок

- Прокси/функция недоступны → `.catch(() => [])` в store, лента не падает (есть `SEED_TRACKS`).
- 401 (токен протух) → понятная ошибка в консоли, подсказка обновить `YANDEX_TOKEN`/`VITE_YANDEX_TOKEN`.
- Трек без mp3-варианта → пропустить.
- Запрещённый хост/путь на функции → `403` (allowlist).

## Тестирование

- Юнит: `isAllowed` (api `/search` ✓, `/tracks/123/download-info` ✓, `/landing3/chart` ✓, storage `download-info` ✓; `/account/status` ✗, `evil.com` ✗).
- Юнит: разбор `?url=` (корректная сборка цели; отсутствие `url` → 400).
- Юнит: `buildResponseHeaders` (один ACAO; upstream `access-control-*` срезаны) — уже есть, переиспользовать/продублировать для `api/proxy.js`.
- Юнит: `yandex.normalizeTrack` и `buildSignedUrl` — уже есть.
- Интеграция/компоненты: обновить моки на `../api/yandex`; держать suite зелёным.
- Ручная проверка вживую (локальный прокси): поиск/лента/воспроизведение полного трека.

## Вне области (YAGNI)

- Per-IP рейт-лимит (нужен Vercel KV/Upstash) — добавить только при реальном абузе.
- BYO-token UI (это вариант C, отклонён).
- Лайки/плейлисты/библиотека Яндекса.

## Безопасность / риски

- Токен только в серверном секрете Vercel + локальном `.env.local`; в публичном бандле его нет.
- Allowlist + CDN-кэш ограничивают абуз функции, но **не устраняют** риск рейтлимита/бана аккаунта владельца под публичной нагрузкой — принято пользователем.
- Токен, засветившийся в переписке 2026-06-05 — рекомендуется перевыпустить.
