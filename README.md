# Instruction Booklet

Минимальное приложение **Next.js (App Router) + Prisma + NeonDB (PostgreSQL)**, готовое к деплою на Vercel.

## Стек

- Next.js 15 (TypeScript, App Router)
- Prisma ORM
- Neon PostgreSQL
- Vercel

## Быстрый старт (локально)

### 1. Установка зависимостей

```powershell
npm install
```

### 2. Настройка Neon

1. Создайте проект на [console.neon.tech](https://console.neon.tech).
2. Скопируйте connection string (рекомендуется **pooled** для serverless).
3. Создайте `.env` из примера:

```powershell
Copy-Item .env.example .env
```

4. Вставьте строку подключения в `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
```

### 3. Миграция и seed

```powershell
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Запуск

```powershell
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — на главной странице отобразятся заметки из БД.

## Деплой на Vercel

1. Запушьте репозиторий на GitHub.
2. Импортируйте проект в [Vercel](https://vercel.com).
3. В **Settings → Environment Variables** добавьте `DATABASE_URL` (Neon pooled connection string).
4. Задеплойте.

После деплоя выполните миграцию и seed против production-БД (один раз):

```powershell
$env:DATABASE_URL = "ваш_neon_connection_string"
npx prisma migrate deploy
npm run db:seed
```

> `postinstall` и `build` автоматически запускают `prisma generate`.

## Модель Note

| Поле      | Тип      |
|-----------|----------|
| id        | UUID     |
| title     | String   |
| createdAt | DateTime |

## Полезные команды

| Команда              | Описание                    |
|----------------------|-----------------------------|
| `npm run dev`        | Dev-сервер                  |
| `npm run build`      | Production-сборка           |
| `npm run db:migrate` | Создать/применить миграцию  |
| `npm run db:push`    | Push схемы без миграции     |
| `npm run db:seed`    | Заполнить тестовыми данными |
| `npm run db:studio`  | Prisma Studio               |
