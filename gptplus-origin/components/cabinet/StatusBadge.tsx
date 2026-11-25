import type { OrderStatus } from "@/lib/mockData";
import { orderStatusClass } from "@/lib/statusStyles";
import { cn } from "@/lib/utils";

type Props = {
  status: OrderStatus;
  className?: string;
};

export function StatusBadge({ status, className }: Props) {
  const label = status === "Активирован" ? "Активна" : status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        orderStatusClass(status),
        className
      )}
    >
      {status === "Активирован" && (
        <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.7)]" aria-hidden />
      )}
      {label}
    </span>
  );
}
