"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuickReply {
  id: string;
  label: string;
  emoji: string;
}

const QUICK_REPLIES: QuickReply[] = [
  { id: "send-token", label: "Отправить токен", emoji: "👆" },
  { id: "get-token", label: "Где взять токен?", emoji: "❓" },
  { id: "how-long", label: "Сколько ждать?", emoji: "⏱" },
  { id: "is-safe", label: "Это безопасно?", emoji: "🔒" },
  { id: "other", label: "Другой вопрос", emoji: "💬" },
];

interface Props {
  onSelect: (id: string) => void;
  className?: string;
}

export function QuickReplyButtons({ onSelect, className }: Props) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 md:flex-wrap", className)}>
      {QUICK_REPLIES.map((qr, i) => (
        <motion.button
          key={qr.id}
          type="button"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(qr.id)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/[0.1] bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-[#10a37f]/40 hover:text-[#10a37f]"
        >
          <span>{qr.emoji}</span>
          {qr.label}
        </motion.button>
      ))}
    </div>
  );
}
