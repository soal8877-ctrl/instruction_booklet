# view-db

Тестовая утилита для просмотра таблиц PostgreSQL и базового CRUD.

## Настройка

В корневом `.env`:

```env
DATABASE_URL="..."           # рабочая БД (Neon / production)
LOCAL_DATABASE_URL="..."     # локальная БД (опционально)
```

## Запуск

```powershell
cd C:\Cursor\instruction_booklet\view-db
npm install
npm run dev
```

Или из корня репозитория:

```powershell
npm run view-db
```

Откройте http://localhost:4000

## Возможности

1. Выбор **локальной** или **рабочей** БД
2. Список таблиц схемы `public`
3. Просмотр данных с пагинацией
4. Создание, изменение и удаление строк (по primary key)

> Только для разработки. Не деплойте на публичный сервер без защиты.
