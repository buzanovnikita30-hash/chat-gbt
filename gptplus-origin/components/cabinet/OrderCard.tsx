import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/cabinet/StatusBadge";
import type { OrderStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const timeline: { key: string; label: string }[] = [
  { key: "created", label: "Создан" },
  { key: "data", label: "Данные получены" },
  { key: "work", label: "В работе" },
  { key: "done", label: "Активирован" },
];

type Props = {
  product: string;
  status: OrderStatus;
  validUntil: string;
};

function timelineIndex(status: OrderStatus): number {
  switch (status) {
    case "Создан":
    case "Ожидаются данные":
      return 0;
    case "Данные получены":
      return 1;
    case "В работе":
    case "Требует уточнения":
      return 2;
    case "Активирован":
      return 3;
    case "Проблема":
      return 1;
    default:
      return 0;
  }
}

export function OrderCard({ product, status, validUntil }: Props) {
  const idx = timelineIndex(status);

  return (
    <Card className="border-white/10 bg-card/80">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Продукт</p>
            <CardTitle className="mt-1 font-heading text-xl">{product}</CardTitle>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Действует до</p>
          <p className="mt-1 font-medium">{validUntil}</p>
        </div>
        <div>
          <p className="mb-3 text-sm text-muted-foreground">Статус заказа</p>
          <div className="flex flex-wrap gap-2">
            {timeline.map((step, i) => (
              <span
                key={step.key}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  i <= idx
                    ? "border-success/50 bg-success/15 text-success"
                    : "border-border bg-muted/30 text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/checkout">Продлить</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="#messages">Написать по заказу</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
