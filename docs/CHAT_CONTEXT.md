# Контекст проекта для новых чатов (Cursor)

Краткая выжимка по **instruction_booklet**. Прикрепляйте этот файл в начале нового чата: `@docs/CHAT_CONTEXT.md`.

---

## Назначение

SaaS для хранения инструкций и заметок: личный кабинет, CRUD заметок, публичные заметки, лайки, вход через Google.

---

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui-подобные компоненты в `components/ui/`, lucide-react |
| Auth | Auth.js (next-auth v5), Google OAuth, JWT-сессия + Prisma Adapter (пользователь в БД) |
| Backend | Server Actions (`lib/actions/`), Route Handlers (`app/api/`) |
| БД | Prisma 6, PostgreSQL (Neon), миграции в `prisma/migrations/` |
| Деплой | Vercel |

---

## Переменные окружения (`.env`)

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | Neon, лучше **pooled** (`-pooler` в хосте) |
| `AUTH_SECRET` | секрет Auth.js |
| `AUTH_URL` | `http://localhost:3000` или URL Vercel |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `LOCAL_DATABASE_URL` | опционально, только для утилиты `view-db` |

Подробно: `AUTH_SETUP.md`, `.env.example`.

---

## Модели Prisma (главное)

- **User** — OAuth-пользователь (`id`, `email`, `name`, `image`).
- **Note** — заметка: `title`, `content`, `isPublic`, `isFavorite`, `authorId` (= userId владельца), `createdAt`, `updatedAt`.
- **Like** — лайк публичной заметки: `@@unique([userId, noteId])`.
- **Account / Session** — таблицы Auth.js.

Схема: `prisma/schema.prisma`. Описание: `DATABASE.md`.

---

## Маршруты

| URL | Описание |
|-----|----------|
| `/` | Лендинг, ссылка на вход / кабинет |
| `/login` | «Войти через Google» |
| `/dashboard` | Мои заметки (CRUD, поиск, пагинация) |
| `/dashboard/public` | Публичные заметки всех пользователей, лайки, `?sort=popular\|recent` |
| `/dashboard/favorites` | Избранное |
| `/dashboard/history` | заглушка |
| `/dashboard/settings` | заглушка |
| `/my-notes` | редирект на `/dashboard` |

API:

- `POST /api/notes/[id]/like` — toggle лайка (только auth, только `isPublic=true`), ответ `{ liked, likesCount }`.
- `app/api/auth/[...nextauth]` — Auth.js.

Middleware защищает `/dashboard/*` (см. `middleware.ts`, `auth.config.ts`).

---

## Ключевые файлы

| Путь | Роль |
|------|------|
| `auth.ts`, `auth.config.ts` | Google + сессия |
| `lib/auth-helpers.ts` | `requireAuth()`, `getOptionalSession()` |
| `lib/actions/notes.ts` | CRUD заметок, toggle public/favorite (проверка `authorId`) |
| `lib/notes/queries.ts` | списки заметок, лайки, сортировка public |
| `components/dashboard/*` | сайдбар, карточки, диалог, `LikeButton`, `NotesWorkspace` |
| `lib/prisma.ts` | singleton Prisma Client |

---

## Утилита view-db

Отдельное мини-приложение в `view-db/` (порт 4000): просмотр таблиц Neon/local.

- Запуск: `npm run view-db`
- **Не** входит в сборку Next.js: `view-db` в `exclude` в `tsconfig.json`.

---

## Команды (PowerShell)

```powershell
cd C:\Cursor\instruction_booklet
npm install
npx prisma migrate deploy   # production / Neon
npx prisma generate
npm run dev                 # http://localhost:3000
npm run build
npm run db:seed
npm run db:studio
```

После изменения схемы локально: `npx prisma migrate dev --name имя_миграции`.

На Vercel после push: `npx prisma migrate deploy` с production `DATABASE_URL`.

---

## Поведение UI (важно для правок)

- Список **«Мои заметки»** сортируется по **`createdAt`** (не `updatedAt`), чтобы карточки не «прыгали» при toggle public/favorite.
- Лайк на карточке показывается только для **`isPublic`** (в «Заметки» и «Публичные»).
- Поиск в кабинете: debounce ~350 ms; URL обновляется **только** если изменились `q` или `sort` (без лишних запросов к БД).
- Оптимистичное UI для замка/глобуса и избранного в `NoteCard`.

---

## Документация в репо

| Файл | Содержание |
|------|------------|
| `README.md` | старт (частично устарел по модели Note) |
| `AUTH_SETUP.md` | Google OAuth, Vercel env, Data Access |
| `DATABASE.md` | сущности БД |
| `view-db/README.md` | локальный просмотр БД |

---

## Типичные проблемы

| Симптом | Что проверить |
|---------|----------------|
| `prisma:error ... Closed` | Neon спит / stale pool; F5, перезапуск `npm run dev`, pooled URL |
| Ошибка сборки на Vercel про `pg` | не убирать `view-db` из exclude `tsconfig.json` |
| Google login loop / JWT | `AUTH_SECRET`, `AUTH_URL`, cookies, см. `AUTH_SETUP.md` |
| `redirect_uri_mismatch` | redirect URI в Google = `{AUTH_URL}/api/auth/callback/google` |

---

## Как продолжать в новом чате

```text
@docs/CHAT_CONTEXT.md
@prisma/schema.prisma
(при необходимости) @lib/actions/notes.ts

Задача: [одно чёткое предложение]
```

Обновляйте этот файл после крупных фич (новые модели, маршруты, env).
