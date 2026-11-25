"use client";

import { useState, useEffect } from "react";
import type { MockOrder, OrderStatus } from "@/lib/mockData";
import { messagesForOrder } from "@/lib/mockData";
import { orderStatusClass } from "@/lib/statusStyles";
import { cn } from "@/lib/utils";

const statusOptions: OrderStatus[] = [
  "Создан",
  "Ожидаются данные",
  "Данные получены",
  "В работе",
  "Активирован",
  "Требует уточнения",
  "Проблема",
];

type Props = {
  order: MockOrder | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
};

export function OrderDrawer({ order, open, onClose, onStatusChange }: Props) {
  const [reply, setReply] = useState("");
  const [localThread, setLocalThread] = useState<
    { id: string; from: "manager"; text: string; time: string }[]
  >([]);

  useEffect(() => {
    if (!order) return;
    const base = messagesForOrder(order.id)
      .filter((m) => m.from === "manager")
      .map((m) => ({
        id: m.id,
        from: "manager" as const,
        text: m.text,
        time: m.time,
      }));
    setLocalThread(base.slice(0, 3));
    setReply("");
  }, [order]);

  if (!order) return null;

  function sendReply() {
    const t = reply.trim();
    if (!t) return;
    setLocalThread((prev) => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        from: "manager",
        text: t,
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setReply("");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Закрыть панель"
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-700 bg-slate-900 text-slate-100 shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <span className="font-mono text-sm font-semibold">{order.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Закрыть
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Клиент
          </h3>
          <p className="mt-1">{order.clientName}</p>
          <p className="text-slate-400">{order.clientEmail}</p>
          <p className="text-slate-400">{order.clientPhone}</p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Заказ
          </h3>
          <p className="mt-1">{order.product}</p>
          <p className="text-slate-400">{order.date}</p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Статус
          </label>
          <select
            value={order.status}
            onChange={(e) =>
              onStatusChange(order.id, e.target.value as OrderStatus)
            }
            className="mt-2 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span
            className={cn(
              "mt-2 inline-block rounded-full border px-2 py-0.5 text-xs",
              orderStatusClass(order.status)
            )}
          >
            {order.status}
          </span>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Сообщения
          </h3>
          <div className="mt-2 space-y-2 rounded border border-slate-700 bg-slate-950/80 p-3">
            {localThread.map((m) => (
              <div key={m.id} className="text-xs">
                <span className="text-slate-500">{m.time}</span>
                <p className="mt-0.5 text-slate-200">{m.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
              placeholder="Ответ клиенту…"
              className="flex-1 rounded border border-slate-600 bg-slate-800 px-2 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={sendReply}
              className="rounded bg-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-600"
            >
              Отправить
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
