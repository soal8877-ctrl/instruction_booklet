## Что есть в системе (сущности)

- **User** — владелец заметок, автор (`Note.author`); OAuth через Auth.js + Google
- **Account / Session** — таблицы Auth.js для OAuth и server-side сессий
- **Note** — заметки (`title`, `content`, `isPublic`, `isFavorite`, `authorId`, `updatedAt`)
- **Like** — лайки публичных заметок (`@@unique([userId, noteId])`)

Схема: `prisma/schema.prisma`

Проверка БД: `npm run db:verify` — создаёт тестового пользователя и заметку с тегом.

