import { cn } from "@/lib/cn";
import { stepIndex, TRACK_STEPS } from "@/lib/order-status";
import type { OrderStatus } from "@/server/types/order.types";

interface OrderTrackerProps {
  status: OrderStatus;
}

export function OrderTracker({ status }: OrderTrackerProps) {
  const reached: number = stepIndex(status);
  return (
    <ol className="flex w-full items-start" aria-label="Order progress">
      {TRACK_STEPS.map((step, index: number) => {
        const done: boolean = index <= reached;
        return (
          <li key={step.status} className="flex flex-1 flex-col items-center gap-1.5 text-center">
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", index === 0 ? "bg-transparent" : done ? "bg-primary" : "bg-border")} />
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {done ? "✓" : index + 1}
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1",
                  index === TRACK_STEPS.length - 1 ? "bg-transparent" : index < reached ? "bg-primary" : "bg-border",
                )}
              />
            </div>
            <span className={cn("text-xs", done ? "font-medium" : "text-muted-foreground")}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
