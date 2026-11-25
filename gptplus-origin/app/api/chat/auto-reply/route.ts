import { type NextRequest, NextResponse } from "next/server";
import { checkDelayedSessions } from "@/lib/chat/autoResponder";
import { createAdminClient } from "@/lib/supabase/server";

// Vercel Cron — вызывается каждые 5 минут
// Конфигурация в vercel.json
export async function GET(request: NextRequest) {
  // Проверяем авторизацию Cron
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Получаем порог из настроек сайта
  const supabase = createAdminClient();
  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "auto_reply_delay_minutes")
    .single();

  const thresholdMinutes = Number(setting?.value ?? 15);

  await checkDelayedSessions(thresholdMinutes);

  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
}
