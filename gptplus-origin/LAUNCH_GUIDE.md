# Инструкция по запуску GBT STORE

## Шаг 1 — Получить ключ Anthropic (AI помощник)

1. Зайди на https://console.anthropic.com
2. Зарегистрируйся или войди
3. Нажми "API Keys" в меню слева
4. Нажми "Create Key" → скопируй ключ (начинается на sk-ant-)
5. Открой файл `.env.local` в корне проекта
6. Добавь строку: `ANTHROPIC_API_KEY=sk-ant-...твой_ключ...`
7. Перезапусти сервер: `Ctrl+C` → `npm run dev`

**Без этого шага AI помощник не работает.**

---

## Шаг 2 — Supabase (база данных)

1. Зайди на https://supabase.com → создай проект
2. В Settings → API скопируй три значения в `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
3. Зайди в SQL Editor → выполни файл `supabase/migrations/001_initial_schema.sql`
4. В Authentication → URL Configuration:
   - Site URL: `https://твой-домен.ru` (или `http://localhost:3000` для теста)
   - Redirect URLs: `https://твой-домен.ru/auth/callback`

---

## Шаг 3 — Telegram Bot (уведомления о заказах)

1. Открой @BotFather в Telegram → `/newbot`
2. Придумай название и username бота
3. Скопируй токен в `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=1234567890:AABBcc...
   TELEGRAM_BOT_USERNAME=ИмяБота
   ```
4. Создай группу в Telegram → добавь бота как администратора
5. Напиши любое сообщение в группу
6. Открой в браузере:
   `https://api.telegram.org/bot{ТВОЙ_ТОКЕН}/getUpdates`
7. Найди `"chat":{"id": -100...}` → скопируй в:
   ```
   TELEGRAM_ADMIN_CHAT_ID=-100xxxxxxxxxx
   ```

---

## Шаг 4 — Платёжная система Pally

1. Зарегистрируйся на https://pally.info
2. Создай магазин → верифицируй
3. Скопируй в `.env.local`:
   ```
   PALLY_API_KEY=...
   PALLY_SHOP_ID=...
   PALLY_WEBHOOK_SECRET=...
   ```
4. В настройках Pally укажи Webhook URL:
   `https://твой-домен.ru/api/payments/pally/webhook`
5. Для теста: `PALLY_TEST_MODE=true`

---

## Шаг 5 — Сделать себя администратором

1. Зарегистрируйся на сайте через `/register`
2. В Supabase → SQL Editor выполни:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'твой@email.com';
   ```
3. Теперь `/admin` доступен

---

## Шаг 6 — Деплой на Vercel

1. Залей проект на GitHub
2. Зайди на https://vercel.com → Import Project → выбери репо
3. В Settings → Environment Variables добавь ВСЕ переменные из `.env.local`
4. Нажми Deploy
5. После деплоя обнови Site URL в Supabase на реальный домен

---

## Полный .env.local для копирования

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=https://твой-домен.ru

# Anthropic AI (ОБЯЗАТЕЛЬНО для чата)
ANTHROPIC_API_KEY=sk-ant-...

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_USERNAME=...
TELEGRAM_ADMIN_CHAT_ID=...

# Pally платежи
PALLY_API_KEY=...
PALLY_SHOP_ID=...
PALLY_WEBHOOK_SECRET=...
PALLY_API_URL=https://pally.info/api
PALLY_TEST_MODE=true

# CryptoCloud
CRYPTOCLOUD_API_KEY=...
CRYPTOCLOUD_SHOP_ID=...

# Аналитика
NEXT_PUBLIC_YM_ID=...
```

---

## Проверка что всё работает

- [ ] Открой http://localhost:3000 — сайт загружается
- [ ] Зелёный курсор виден (кольцо + точка с glow)
- [ ] Анимация нейросети на фоне работает (узлы, линии, шестиугольники)
- [ ] Нейросеть реагирует на движение мыши
- [ ] Напиши в AI чат "Что такое токен?" — должен ответить
- [ ] Кнопки "Подключить" мигают бликами shimmer
- [ ] Популярная кнопка (1 990 ₽) имеет пульсирующее кольцо
- [ ] Иконки в сайдбаре зелёные при активном маршруте
- [ ] Telegram ссылки ведут на https://t.me/subs_support
- [ ] `/admin` доступен после назначения роли
