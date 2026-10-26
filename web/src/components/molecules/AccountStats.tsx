interface AccountStat {
  label: string;
  value: number;
}

interface AccountStatsProps {
  stats: AccountStat[];
}

export function AccountStats({ stats }: AccountStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat: AccountStat) => (
        <div key={stat.label} className="rounded-2xl border border-(--pp-line) bg-background px-5 py-4">
          <span className="text-xs tracking-[0.08em] text-muted-foreground uppercase">{stat.label}</span>
          <b className="mt-1 block text-2xl">{stat.value.toLocaleString("en-IN")}</b>
        </div>
      ))}
    </div>
  );
}
