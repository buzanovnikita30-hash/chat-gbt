#!/usr/bin/env python3
"""
SubРФ — Импорт исторических отзывов из Telegram через Telethon
 
Требования:
    pip install telethon python-dotenv supabase
    
Переменные окружения:
    TELEGRAM_API_ID      — API ID из my.telegram.org
    TELEGRAM_API_HASH    — API Hash из my.telegram.org
    TELEGRAM_REVIEWS_CHAT — ссылка или ID чата с отзывами (@chatusername или -100xxxxxxxxxx)
    SUPABASE_URL         — URL вашего Supabase проекта
    SUPABASE_SERVICE_KEY — Service Role ключ (из Supabase Dashboard → Settings → API)
    
Запуск:
    python scripts/import-reviews.py
"""

import asyncio
import os
import sys
from datetime import datetime

# Попытка импорта зависимостей
try:
    from telethon import TelegramClient
    from telethon.tl.types import MessageMediaPhoto
    from supabase import create_client
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Ошибка: {e}")
    print("Установите зависимости: pip install telethon python-dotenv supabase")
    sys.exit(1)

load_dotenv()

API_ID = int(os.getenv("TELEGRAM_API_ID", "0"))
API_HASH = os.getenv("TELEGRAM_API_HASH", "")
REVIEWS_CHAT = os.getenv("TELEGRAM_REVIEWS_CHAT", "")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "") or os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "") or os.getenv("SUPABASE_SERVICE_KEY", "")

if not all([API_ID, API_HASH, REVIEWS_CHAT, SUPABASE_URL, SUPABASE_KEY]):
    print("Ошибка: не все переменные окружения установлены.")
    print("Проверьте: TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_REVIEWS_CHAT, SUPABASE_URL, SUPABASE_SERVICE_KEY")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


async def import_reviews():
    client = TelegramClient("subrf_import_session", API_ID, API_HASH)
    await client.start()
    
    print(f"Подключено к Telegram. Получаем сообщения из: {REVIEWS_CHAT}")
    
    imported = 0
    skipped = 0
    
    async for message in client.iter_messages(REVIEWS_CHAT, limit=500):
        if not message.text and not message.media:
            continue
        
        text = message.text or "[медиа-сообщение]"
        author_name = None
        author_username = None
        
        if message.sender:
            sender = message.sender
            first = getattr(sender, "first_name", "") or ""
            last = getattr(sender, "last_name", "") or ""
            author_name = f"{first} {last}".strip() or None
            author_username = getattr(sender, "username", None)
        
        # Проверяем существование
        existing = supabase.table("reviews").select("id").eq(
            "telegram_message_id", message.id
        ).execute()
        
        if existing.data:
            skipped += 1
            continue
        
        # Вставляем в БД
        result = supabase.table("reviews").insert({
            "telegram_message_id": message.id,
            "telegram_chat_id": message.chat_id,
            "author_name": author_name,
            "author_username": author_username,
            "content": text,
            "telegram_date": message.date.isoformat(),
            "status": "pending",
        }).execute()
        
        if result.data:
            imported += 1
            print(f"  Импортирован отзыв #{message.id} от {author_name or 'Аноним'}")
    
    await client.disconnect()
    print(f"\nГотово! Импортировано: {imported}, пропущено (уже есть): {skipped}")


if __name__ == "__main__":
    asyncio.run(import_reviews())
