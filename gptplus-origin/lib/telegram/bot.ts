const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID ?? "";

export interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: "HTML" | "MarkdownV2" | "Markdown";
  reply_markup?: {
    inline_keyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  };
}

export async function sendMessage(msg: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...msg, chat_id: msg.chat_id || TELEGRAM_ADMIN_CHAT_ID }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram sendMessage error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Telegram sendMessage exception:", err);
    return false;
  }
}

export function adminMsg(text: string, adminUrl?: string): TelegramMessage {
  const msg: TelegramMessage = {
    chat_id: TELEGRAM_ADMIN_CHAT_ID,
    text,
    parse_mode: "HTML",
  };

  if (adminUrl) {
    msg.reply_markup = {
      inline_keyboard: [[{ text: "📋 Открыть в админке", url: adminUrl }]],
    };
  }

  return msg;
}
