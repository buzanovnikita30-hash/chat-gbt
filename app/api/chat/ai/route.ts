import { NextRequest } from "next/server";

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/v1/chat/completions";
const FALLBACK_TEXT =
  "Сейчас ИИ-чат временно недоступен. Напишите оператору или в Telegram: t.me/subs_support";

export async function POST(req: NextRequest) {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("[AI DeepSeek] DEEPSEEK_API_KEY не задан");
    return new Response(FALLBACK_TEXT, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  let body: { messages?: Array<{ role: string; content: string }> };
  try {
    body = (await req.json()) as { messages?: Array<{ role: string; content: string }> };
  } catch {
    return new Response(
      JSON.stringify({ error: "Неверный формат" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = (body.messages ?? [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content?.trim()
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.trim(),
    }));

  if (!messages.length || messages.at(-1)?.role !== "user") {
    return new Response(
      JSON.stringify({ error: "Нужно сообщение от пользователя" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const systemPrompt = `Ты — AI помощник магазина GBT STORE.
Продаёшь подписки ChatGPT Go, Plus и Pro для россиян без иностранной карты.
Отвечаешь на ВСЕ вопросы клиентов подробно и по делу. Всегда на русском.

ТАРИФЫ (1 месяц):
- ChatGPT Go — 1 000 ₽
- ChatGPT Plus, для новых аккаунтов — 1 490 ₽
- ChatGPT Plus, популярный вариант — 1 990 ₽ (подходит всем)
- ChatGPT Plus, быстрая активация — 2 490 ₽ (за 5 минут)

ChatGPT Pro: уточни цену у оператора в t.me/subs_support

КАК РАБОТАЕТ:
1. Выбираешь тариф, оплачиваешь
2. Отправляешь нам токен от ChatGPT аккаунта
3. Специалист активирует за 5–15 минут
4. Приходит уведомление — всё готово

ТОКЕН — это НЕ пароль. Временный ключ только для активации.
Как получить: F12 → Application → Cookies → chat.openai.com
→ найди __Secure-next-auth.session-token → скопируй Value

ОПЛАТА: карты РФ, СБП, крипта. Иностранная карта не нужна.
ГАРАНТИЯ: возврат если активация не прошла.
ПОДДЕРЖКА: t.me/subs_support`;

    const deepseekMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const deepseekRes = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: deepseekMessages,
        temperature: 0.5,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!deepseekRes.ok) {
      const errorText = await deepseekRes.text();
      console.error("[AI DeepSeek] Ошибка API:", errorText);
      return new Response(FALLBACK_TEXT, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    const data = (await deepseekRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content =
      data.choices?.[0]?.message?.content?.trim() ||
      "Не удалось получить ответ. Напишите в поддержку: t.me/subs_support";

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[AI DeepSeek] Ошибка:", err);
    return new Response(FALLBACK_TEXT, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
}
