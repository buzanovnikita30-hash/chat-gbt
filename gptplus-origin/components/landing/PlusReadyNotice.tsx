import { PLUS_READY_CHECKOUT_WARNING, PLUS_READY_HOW_IT_WORKS } from "@/lib/chatgpt-data";
import { cn } from "@/lib/utils";

export function PlusReadyNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200/80 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900",
        className,
      )}
    >
      <p>{PLUS_READY_CHECKOUT_WARNING}</p>
      <ol className="mt-2 list-decimal space-y-0.5 pl-4">
        {PLUS_READY_HOW_IT_WORKS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-2">После выдачи корректных данных для входа услуга считается оказанной.</p>
    </div>
  );
}
