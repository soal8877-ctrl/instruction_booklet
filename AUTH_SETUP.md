# Настройка входа через Google (Auth.js)

В проекте **instruction_booklet** отдельной формы «регистрации» нет: пользователь нажимает **«Войти через Google»** на странице `/login`. При **первом** входе Auth.js и Prisma автоматически создают запись в таблице `User` в PostgreSQL (Neon).

---

## Что нужно заранее

- Аккаунт Google
- Рабочая база Neon (`DATABASE_URL` в `.env`)
- Применённые миграции Prisma (в т.ч. таблицы Auth.js: `Account`, `Session`)

```powershell
cd C:\Cursor\instruction_booklet
npx prisma migrate deploy
```

---

## Шаг 1. Проект в Google Cloud

1. Откройте [Google Cloud Console](https://console.cloud.google.com/).
2. Создайте проект или выберите существующий (вверху слева — имя проекта → **New Project**).
3. Убедитесь, что выбран именно этот проект.

---

## Шаг 2. Настройка Google Auth Platform (новый интерфейс)

Если видите страницу **OAuth Overview** с текстом *«Google Auth Platform not configured yet»* и кнопкой **Get started** — OAuth ещё не настроен. Тип пользователя (**External**) появится **в мастере после Get started**, а не на этой пустой странице.

### Вариант A — через боковое меню (как на скриншоте)

1. Убедитесь, что выбран проект **instruction-booklet** (вверху слева).
2. Откройте **Google Auth Platform** (левое меню) → **Overview**.
3. Нажмите синюю кнопку **Get started**.
4. В мастере укажите:
   - **App name** — `Instruction Booklet`
   - **User support email** — ваша почта
   - **Audience / User type** — **External** (вход любым Google-аккаунтом; для личного проекта это обычный выбор)
   - **Developer contact email** — ваша почта
5. Сохраните шаги мастера до конца.

Дальше по разделам слева:

| Раздел | Что сделать |
|--------|-------------|
| **Branding** | Название приложения, при желании логотип |
| **Audience** | Тип **External**; в режиме **Testing** добавьте **Test users** (ваш Gmail) |
| **Data Access** | Настройка scopes — см. **раздел ниже** |
| **Clients** | Создание Client ID — см. шаг 3 |

### Data Access — какие scopes добавить и как

Раздел **Data Access** (иногда в старом интерфейсе — **Scopes** на экране согласия OAuth) задаёт, **какие данные Google может отдать вашему приложению** после входа.

Для **instruction_booklet** и стандартного провайдера Google в Auth.js достаточно **трёх несекретных (non-sensitive) scope**:

| Scope (как в консоли) | Зачем |
|------------------------|--------|
| `openid` | Идентификация пользователя (OpenID Connect) |
| `.../auth/userinfo.email` | Email → поле `User.email` в БД |
| `.../auth/userinfo.profile` | Имя и фото → `User.name`, `User.image` |

Полные названия в списке Google часто выглядят так:

- **OpenID Connect** → `openid`
- **Google People API** или **Google OAuth2 API** → `.../auth/userinfo.email`, `.../auth/userinfo.profile`

#### Пошагово в Google Cloud (новый интерфейс)

1. Откройте **Google Auth Platform** → **Data Access**  
   Прямая ссылка для проекта:  
   `https://console.cloud.google.com/auth/scopes?project=instruction-booklet`
2. Найдите кнопку **Add scope** / **Add or remove scopes** / **Manage scopes** (формулировка может отличаться).
3. В списке выберите scope из категории **Non-sensitive** (несекретные):
   - `openid`
   - `email` / `userinfo.email`
   - `profile` / `userinfo.profile`
4. **Не добавляйте** лишние scope (Gmail, Drive, Calendar и т.д.) — для входа они не нужны и усложняют проверку приложения.
5. Нажмите **Save** / **Update**.

#### Если scopes уже есть

После мастера **Get started** Google иногда **уже добавляет** `email` и `profile`. Тогда:

- Откройте **Data Access** и проверьте, что в списке **Your non-sensitive scopes** (или аналог) есть как минимум **email** и **profile** (и желательно **openid**).
- Если всё на месте — **ничего дополнительно делать не нужно**, переходите к **Clients**.

#### Старый интерфейс (OAuth consent screen)

1. **APIs & Services** → **OAuth consent screen** → **Edit app**.
2. Раздел **Scopes** → **Add or remove scopes**.
3. Отметьте те же три scope → **Update** → **Save**.

#### Что увидит пользователь при входе

На экране Google будет что-то вроде: приложение запрашивает доступ к **имени, фото профиля и email**. Это нормально и соответствует полям в `User`.

#### Проверка (Verification)

Для **email / profile / openid** в режиме **Testing** обычно **не требуется** полная верификация приложения в Google. Верификация нужна, если вы добавляете **чувствительные** или **restricted** scopes (доступ к почте, файлам и т.п.) — для нашего проекта это не требуется.

### Вариант B — старый путь (если меню другое)

**APIs & Services** → **OAuth consent screen** — те же поля и **External**.

---

## Шаг 3. Учётные данные OAuth (Client ID)

### Новый интерфейс

1. **Google Auth Platform** → **Clients** → **Create client** (или **+ Create OAuth client**).
2. **Application type**: **Web application**.

### Старый интерфейс

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
2. **Application type**: **Web application**.
3. **Name**: например `instruction-booklet-web`.
4. **Authorized JavaScript origins** (опционально, для локальной разработки можно добавить):
   - `http://localhost:3000`
   - `https://ваш-проект.vercel.app` (после деплоя)
5. **Authorized redirect URIs** — обязательно:

   | Окружение | URI |
   |-----------|-----|
   | Локально | `http://localhost:3000/api/auth/callback/google` |
   | Vercel | `https://ваш-проект.vercel.app/api/auth/callback/google` |

   Путь всегда: `/api/auth/callback/google` (как в Auth.js).

6. Нажмите **Create**.
7. Скопируйте **Client ID** и **Client secret** — они понадобятся в `.env`.

---

## Шаг 4. Переменные окружения в проекте

Скопируйте пример, если файла `.env` ещё нет:

```powershell
Copy-Item .env.example .env
```

Добавьте или обновите в `.env`:

```env
DATABASE_URL="postgresql://..."

AUTH_SECRET="длинная-случайная-строка"
AUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

### AUTH_SECRET

Сгенерировать в PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Вставьте результат в `AUTH_SECRET` (без пробелов и кавычек внутри значения).

### AUTH_URL

- Локально: `http://localhost:3000`
- На Vercel: `https://ваш-домен.vercel.app` (без слэша в конце)

---

## Шаг 5. Проверка локально

```powershell
npm install
npm run dev
```

1. Откройте http://localhost:3000/login  
2. Нажмите **«Войти через Google»**.  
3. Выберите аккаунт Google (должен быть в **Test users**, если приложение в режиме Testing).  
4. После успеха — редирект на `/dashboard`.  
5. В БД появятся записи в `User`, `Account`, `Session` (можно посмотреть через `npm run db:studio`).

Выход: кнопка **«Выйти»** в личном кабинете.

---

## Шаг 6. Деплой на Vercel

В **Project → Settings → Environment Variables** добавьте:

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | строка Neon (pooled) |
| `AUTH_SECRET` | тот же секрет, что локально (или новый, но один на все окружения проекта) |
| `AUTH_URL` | `https://ваш-проект.vercel.app` |
| `GOOGLE_CLIENT_ID` | из Google Cloud |
| `GOOGLE_CLIENT_SECRET` | из Google Cloud |

В Google Cloud в **Authorized redirect URIs** добавьте production-URL:

`https://ваш-проект.vercel.app/api/auth/callback/google`

Сделайте **Redeploy** после изменения переменных.

---

## Частые ошибки

| Симптом | Что проверить |
|---------|----------------|
| `redirect_uri_mismatch` | Redirect URI в Google **точно** совпадает с URL приложения + `/api/auth/callback/google` |
| `Access blocked: This app's request is invalid` | Заполнен OAuth consent screen, создан Web client |
| Вход только для некоторых почт | Режим **Testing** — добавьте email в **Test users** или опубликуйте приложение |
| `Configuration` / нет `AUTH_SECRET` | Заданы `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| `JWTSessionError` / `Invalid Compact JWE`, снова `/login` после Google | В `.env` задан **AUTH_SECRET**; очистите cookies для `localhost:3000` (или режим инкогнито); перезапустите `npm run dev` |
| Ошибка после входа, нет пользователя в БД | `npx prisma migrate deploy`, корректный `DATABASE_URL` |
| На Vercel редирект не туда | `AUTH_URL` = публичный URL Vercel, не `localhost` |

---

## Связь с кодом проекта

| Файл | Роль |
|------|------|
| `auth.ts` | Google provider, Prisma Adapter, сессии в БД |
| `auth.config.ts` | Редиректы и защита маршрутов в middleware |
| `middleware.ts` | `/dashboard`, `/my-notes` только для авторизованных |
| `app/login/page.tsx` | Кнопка «Войти через Google» |
| `prisma/schema.prisma` | `User`, `Account`, `Session` |

После настройки пользователь может **войти**, **выйти**; заметки на `/my-notes` видны только владельцу (`authorId` = `session.user.id`).
