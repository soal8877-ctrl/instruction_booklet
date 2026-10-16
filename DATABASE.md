## Что есть в системе (сущности)

- **User** — владелец заметок, автор (`Note.author`); OAuth через Auth.js + Google
- **Account / Session** — таблицы Auth.js для OAuth и server-side сессий
- **Note** — заметки
- **Tag** — метки; связь с заметками **многие-ко-многим** (`Note` ↔ `Tag`)

Схема: `prisma/schema.prisma`

Проверка БД: `npm run db:verify` — создаёт тестового пользователя и заметку с тегом.

