"use client";

import type { MockOrder, OrderStatus } from "@/lib/mockData";
import { orderStatusClass } from "@/lib/statusStyles";
import { cn } from "@/lib/utils";

type Props = {
  orders: MockOrder[];
  onRowClick: (order: MockOrder) => void;
};

export function OrdersTable({ orders, onRowClick }: Props) {
  return (
    <div className="overflow-x-auto rounded border border-slate-700">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/80">
            <th className="px-3 py-2 font-medium text-slate-400">ID</th>
            <th className="px-3 py-2 font-medium text-slate-400">Клиент</th>
            <th className="px-3 py-2 font-medium text-slate-400">Продукт</th>
            <th className="px-3 py-2 font-medium text-slate-400">Статус</th>
            <th className="px-3 py-2 font-medium text-slate-400">Дата</th>
            <th className="px-3 py-2 font-medium text-slate-400">Действие</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className="cursor-pointer border-b border-slate-800 hover:bg-slate-800/50"
              onClick={() => onRowClick(o)}
            >
              <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
              <td className="px-3 py-2">{o.clientName}</td>
              <td className="px-3 py-2">{o.product}</td>
              <td className="px-3 py-2">
                <span
                  className={cn(
                    "inline-block rounded-full border px-2 py-0.5 text-xs",
                    orderStatusClass(o.status as OrderStatus)
                  )}
                >
                  {o.status}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-400">{o.date}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(o);
                  }}
                >
                  Открыть
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
