import { createAdminClient } from "@/lib/supabase/server";
import { notifyDelayedSession } from "@/lib/telegram/notifications";

const AUTO_REPLY_MESSAGES = [
  "Здравствуйте! Ваш запрос принят. Наш специалист ответит в ближайшее время, обычно это занимает не больше 15 минут.",
  "Спасибо за обращение! Мы работаем 24/7 и ответим вам в самое ближайшее время.",
  "Сообщение получено! Оператор подключится к вам скоро. Если ваш вопрос срочный — напишите в Telegram @subs_support",
];

export function isNightTime(): boolean {
  const hour = new Date().getUTCHours() + 3; // Московское время (UTC+3)
  const adjustedHour = hour >= 24 ? hour - 24 : hour;
  return adjustedHour >= 22 || adjustedHour < 9;
}

export function getAutoReplyMessage(isNight = false): string {
  if (isNight) {
    return "Добрый вечер! Ваше сообщение получено. Сейчас ночное время, оператор ответит утром (9:00-22:00 МСК). Если срочно — @subs_support в Telegram.";
  }
  return AUTO_REPLY_MESSAGES[Math.floor(Math.random() * AUTO_REPLY_MESSAGES.length)];
}

export async function sendAutoReply(sessionId: string): Promise<void> {
  const supabase = createAdminClient();
  const night = isNightTime();

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    sender_type: "auto",
    content: getAutoReplyMessage(night),
    is_auto_reply: true,
  });

  // Обновляем сессию
  await supabase
    .from("chat_sessions")
    .update({ last_operator_reply_at: new Date().toISOString() })
    .eq("id", sessionId);
}

// Проверяем сессии без ответа дольше порогового времени
export async function checkDelayedSessions(thresholdMinutes = 15): Promise<void> {
  const supabase = createAdminClient();
  const thresholdDate = new Date(Date.now() - thresholdMinutes * 60 * 1000).toISOString();

  // Открытые сессии без ответа оператора дольше порога
  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("id, first_message_at, last_operator_reply_at")
    .eq("status", "open")
    .eq("type", "operator")
    .lt("first_message_at", thresholdDate)
    .is("last_operator_reply_at", null);

  if (!sessions) return;

  for (const session of sessions) {
    const firstMsg = new Date(session.first_message_at ?? "").getTime();
    const elapsed = Math.round((Date.now() - firstMsg) / 60000);

    // Отправляем автоответ если ещё не было
    await sendAutoReply(session.id);

    // Уведомляем администраторов
    await notifyDelayedSession(session.id, elapsed);
  }
}
