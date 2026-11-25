# SubРФ — Руководство по развёртыванию

## Стек технологий

| Слой | Технология |
|------|-----------|
| Фреймворк | Next.js 14 App Router + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Framer Motion |
| Auth & DB | Supabase (Auth, PostgreSQL, Realtime, Storage) |
| Платежи (RU) | Pally |
| Платежи (Crypto) | CryptoCloud |
| AI Chat | Anthropic Claude (claude-sonnet-4-5) |
| Уведомления | Telegram Bot API |
| Аналитика | Яндекс.Метрика |
| Деплой | Vercel |

---

## 1. Локальный запуск

```bash
# Установить зависимости
npm install

# Скопировать переменные окружения
cp .env.example .env.local
# ← Заполните .env.local

# Запустить dev-сервер
npm run dev
```

---

## 2. Настройка Supabase

### 2.1 Создание проекта

1. Зайдите на [supabase.com](https://supabase.com) и создайте новый проект.
2. В **Settings → API** скопируйте `Project URL`, `anon key` и `service_role key` в `.env.local`.

### 2.2 Применение миграции

Выполните SQL из `supabase/migrations/001_initial_schema.sql` в **SQL Editor** в панели Supabase.

### 2.3 Auth настройки

- **Settings → Authentication → URL Configuration:**
  - Site URL: `https://your-domain.com`
  - Redirect URLs: `https://your-domain.com/auth/callback`
- **Settings → Authentication → Email:** включите подтверждение email.

---

## 3. Настройка Telegram Bot

### 3.1 Создание бота

1. Откройте [@BotFather](https://t.me/BotFather) и создайте нового бота.
2. Скопируйте токен в `TELEGRAM_BOT_TOKEN`.

### 3.2 Включение Telegram Login

1. В BotFather: `/setdomain` → укажите ваш домен.
2. Заполните `TELEGRAM_BOT_USERNAME` и `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`.

### 3.3 Webhook для входящих отзывов

После деплоя выполните один раз:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-domain.com/api/reviews/webhook" \
  -d "secret_token=<YOUR_WEBHOOK_SECRET>"
```

### 3.4 Admin Chat ID

1. Создайте Telegram-группу для уведомлений.
2. Добавьте бота в группу как администратора.
3. Отправьте любое сообщение и узнайте `chat_id` через:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
4. Заполните `TELEGRAM_ADMIN_CHAT_ID` (обычно `-100...`).

---

## 4. Настройка Pally

1. Зарегистрируйтесь на [pally.info](https://pally.info) и создайте магазин.
2. Скопируйте `shop_id` и `secret_key` в `.env.local`.
3. В настройках магазина укажите Webhook URL: `https://your-domain.com/api/payments/pally/webhook`
4. Укажите Success URL: `https://your-domain.com/checkout/success?orderId={ORDER_ID}`
5. Укажите Fail URL: `https://your-domain.com/checkout/fail?orderId={ORDER_ID}`

> ⚠️ API Pally уточните в их документации и обновите `lib/payments/pally.ts`

---

## 5. Настройка CryptoCloud

1. Зарегистрируйтесь на [cryptocloud.plus](https://cryptocloud.plus) и создайте магазин.
2. Скопируйте `API key` и `Shop ID` в `.env.local`.
3. Укажите Webhook URL в настройках: `https://your-domain.com/api/payments/crypto/webhook`

---

## 6. Настройка Anthropic

1. Перейдите на [console.anthropic.com](https://console.anthropic.com) и создайте API key.
2. Заполните `ANTHROPIC_API_KEY`.

---

## 7. Деплой на Vercel

```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel

# Или подключите GitHub-репозиторий в Vercel Dashboard
```

После деплоя:
- Добавьте все переменные из `.env.example` в **Vercel → Settings → Environment Variables**.
- Проверьте, что Vercel Cron Jobs создались (секция **Cron Jobs** в проекте).
- Убедитесь, что `CRON_SECRET` совпадает с заголовком, который Vercel отправляет в cron-маршруты.

---

## 8. Импорт исторических отзывов

```bash
# Установить Python-зависимости
pip install telethon supabase python-dotenv

# Запустить импорт
python scripts/import-reviews.py
```

Убедитесь, что в `.env.local` заполнены `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_REVIEWS_CHAT`.

---

## 9. Яндекс.Метрика

1. Создайте счётчик на [metrika.yandex.ru](https://metrika.yandex.ru).
2. Скопируйте номер счётчика в `NEXT_PUBLIC_YM_ID`.

---

## 10. Первый запуск

После деплоя выполните в Supabase SQL Editor:

```sql
-- Создать первого администратора (замените email)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

Администратор будет иметь доступ к `/admin`.

---

## Структура проекта

```
app/
├── (public)/          # Лендинг, Privacy, Terms
├── (auth)/            # Login, Register, Callback
├── (checkout)/        # Checkout flow
├── (dashboard)/       # Личный кабинет пользователя
├── (admin)/           # Панель администратора
└── api/               # API routes
    ├── auth/
    ├── chat/
    ├── payments/
    └── reviews/

components/
├── analytics/         # YandexMetrika
├── chat/              # AIChat, OperatorChat, ChatSwitcher
├── layout/            # Navbar, LandingFooter
├── sections/          # Секции лендинга
└── ui/                # Общие UI-компоненты

lib/
├── chat/              # autoResponder
├── payments/          # pally.ts, crypto.ts
├── supabase/          # client, server, middleware
├── telegram/          # bot.ts, notifications.ts
└── validations.ts

supabase/migrations/   # SQL схема БД
scripts/               # Python скрипты
```
