import { type NextRequest, NextResponse } from "next/server";

// Vercel Cron — еженедельный импорт отзывов из Telegram
// Полный исторический импорт через scripts/import-reviews.py (Telethon)
export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // В рамках API синхронизация ограничена — основной импорт через Python скрипт
  // Здесь можно реализовать getUpdates для свежих сообщений
  return NextResponse.json({
    ok: true,
    message: "Sync via API limited. Use scripts/import-reviews.py for historical import.",
    syncedAt: new Date().toISOString(),
  });
}
