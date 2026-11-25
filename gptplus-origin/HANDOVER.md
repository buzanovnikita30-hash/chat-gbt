# GBT STORE — Инструкция по запуску и передаче

## Что нужно сделать ДО запуска (один раз)

### 1. Получить Anthropic ключ (AI чат)
1. Зайди: https://console.anthropic.com
2. API Keys → Create Key
3. Скопируй ключ (sk-ant-...) в `.env.local`:
   `ANTHROPIC_API_KEY=sk-ant-...`
4. Перезапусти: `Ctrl+C` → `npm run dev`

### 2. Настроить Supabase
1. Зайди: https://supabase.com → твой проект
2. SQL Editor → New Query → вставь `supabase/migrations/001_initial_schema.sql` → Run
3. Authentication → URL Configuration:
   - Site URL: `https://твой-домен.ru`
   - Redirect URLs: `https://твой-домен.ru/auth/callback`

### 3. Настроить Telegram бота
1. `@BotFather` → `/newbot` → получи токен → добавь в `.env.local`
2. Создай группу для уведомлений → добавь бота как admin
3. Узнай chat_id: `https://api.telegram.org/bot{TOKEN}/getUpdates`
4. Добавь `TELEGRAM_ADMIN_CHAT_ID` в `.env.local`
5. `@BotFather` → `/setdomain` → укажи домен сайта

### 4. Привязать Telegram группу с отзывами
1. Создай или используй существующую группу с отзывами
2. Добавь бота в эту группу как admin
3. Узнай `chat_id` группы → добавь `TELEGRAM_REVIEWS_GROUP_ID`
4. После деплоя зарегистрируй webhook:
   `curl "https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://твой-домен.ru/api/reviews/webhook&secret_token={TELEGRAM_WEBHOOK_SECRET}"`

### 5. Настроить Pally
1. Зарегистрируйся: https://pally.info
2. Создай магазин → верифицируй
3. Получи Shop ID и Secret Key → добавь в `.env.local`
4. В настройках Pally укажи Webhook:
   `https://твой-домен.ru/api/payments/pally/webhook`
5. Измени `PALLY_TEST_MODE=false` когда готов принимать платежи

### 6. Задеплоить на Vercel
1. Залей проект на GitHub
2. Vercel.com → New Project → импортируй репозиторий
3. Settings → Environment Variables → добавь все переменные из `.env.local`
4. Deploy → получи URL
5. Обнови `NEXT_PUBLIC_APP_URL` на реальный URL
6. Обнови Site URL в Supabase на реальный URL

### 7. Сделать себя администратором
1. Зарегистрируйся через `/register`
2. Supabase → SQL Editor:
   `UPDATE public.profiles SET role = 'admin' WHERE email = 'твой@email.com';`
3. Теперь `/admin` доступен

### 8. Передать доступ заказчику
1. Добавь его email в Supabase → Authentication → Users
2. Или попроси его зарегистрироваться через сайт
3. Supabase → SQL Editor:
   `UPDATE public.profiles SET role = 'operator' WHERE email = 'email_заказчика@mail.ru';`
4. Оператор видит `/admin/orders`, `/admin/chat`
5. Для полного admin: `SET role = 'admin'`

## Что делает заказчик каждый день
- `/admin` — панель управления
- `/admin/orders` — новые заказы, смена статусов
- `/admin/chat` — чаты с клиентами
- `/admin/reviews` — модерация отзывов из Telegram

## Чеклист перед открытием клиентам
- [ ] `ANTHROPIC_API_KEY` добавлен → AI отвечает
- [ ] Supabase миграции выполнены → регистрация работает
- [ ] Telegram бот настроен → уведомления приходят
- [ ] Pally настроен → оплата проходит (сначала тест)
- [ ] Все кнопки кликабельны
- [ ] `/admin` доступен нужным людям
- [ ] Домен привязан к Vercel
- [ ] `PALLY_TEST_MODE=false` (когда готов к реальным платежам)
