import { formatPrice } from "@/lib/format-price";

interface TinglePointsCardProps {
  balance: number;
}

const CHIPS: string[] = ["1 point = ₹1", "Use up to 15% per order"];

export function TinglePointsCard({ balance }: TinglePointsCardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary/70 p-7 text-primary-foreground">
      <span aria-hidden className="absolute -top-14 -right-14 size-56 rounded-full bg-accent/35" />
      <div className="relative flex flex-col gap-1">
        <span className="text-xs tracking-[0.12em] uppercase opacity-75">Tingle Points balance</span>
        <p className="mt-2 text-6xl leading-none font-bold">
          {balance.toLocaleString("en-IN")}
          <span className="ml-2 text-base font-medium opacity-80">{balance === 1 ? "point" : "points"}</span>
        </p>
        <p className="mt-2 text-sm opacity-85">Worth {formatPrice(balance)} off your next order</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {CHIPS.map((chip: string) => (
            <span key={chip} className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
