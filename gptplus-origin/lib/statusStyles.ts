import type { OrderStatus } from "@/lib/mockData";

export function orderStatusClass(status: OrderStatus): string {
  switch (status) {
    case "Создан":
      return "bg-slate-500/25 text-slate-200 border-slate-500/40";
    case "Ожидаются данные":
      return "bg-warning/20 text-warning border-warning/35";
    case "Данные получены":
      return "bg-primary/20 text-primary border-primary/40";
    case "В работе":
      return "animate-pulse-soft bg-primary/25 text-primary border-primary/45";
    case "Активирован":
      return "bg-success/20 text-success border-success/40";
    case "Требует уточнения":
      return "bg-warning/25 text-warning border-warning/45";
    case "Проблема":
      return "bg-danger/20 text-danger border-danger/45";
    default:
      return "bg-muted text-muted-foreground";
  }
}
