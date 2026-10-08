## Что есть в системе (сущности):

Note - заметки
User — владелец промтов, автор, голосующий
Prompt — сам промт (может быть приватным или публичным)
Tag — метки (многие-ко-многим с Prompt)
Vote — голос пользователя за публичный промт (уникально: один пользователь → один голос на промт)
(опционально) Collection / Folder — папки/коллекции для организации
(опционально) PromptVersion — версии промта (история изменений)

## Ключевые правила:

- Публичность — это свойство Prompt (visibility)
- Голосовать можно только по публичным (проверяется на уровне приложения; можно усилить триггером/констрейнтом позже)
- Голос уникален: (userId, promptId) — уникальный индекс

## Схема базы данных
- Note: id, ownerId -> User, title, createdAt
- User: id (cuid), email unique, name optional, createdAt
- Prompt: id, ownerId -> User, title, content, description optional, categoryId -> Category,
  visibility (PRIVATE|PUBLIC, default PRIVATE), createdAt, updatedAt, publishedAt nullable
- Vote: id, userId -> User, promptId -> Prompt, value int default 1, createdAt
- Category: id, category
- Ограничение: один пользователь может проголосовать за промт только один раз:
  UNIQUE(userId, promptId)
- Индексы:
  Prompt(ownerId, updatedAt)
  Prompt(visibility, createdAt)
  Vote(promptId)
  Vote(userId)
- onDelete: Cascade для связей
