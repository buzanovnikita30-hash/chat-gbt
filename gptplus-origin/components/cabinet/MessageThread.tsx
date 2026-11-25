"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChatMessage } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type Props = {
  initialMessages: ChatMessage[];
};

export function MessageThread({ initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");

  function send() {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      {
        id: `local-${Date.now()}`,
        from: "client",
        text: t,
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setText("");
  }

  return (
    <Card id="messages" className="border-white/10 bg-card/80">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Сообщения</CardTitle>
        <p className="text-sm text-muted-foreground">
          Переписка с менеджером (демо, без отправки на сервер).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-background/40 p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.from === "client" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  msg.from === "client"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-muted text-foreground"
                )}
              >
                <p>{msg.text}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px] opacity-70",
                    msg.from === "client" ? "text-right" : ""
                  )}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ваше сообщение…"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="button" onClick={send}>
            Отправить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
