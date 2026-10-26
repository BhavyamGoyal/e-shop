const STEPS: { title: string; text: string }[] = [
  { title: "Earn", text: "1 point for every ₹100 you spend." },
  { title: "Redeem", text: "1 point = ₹1 off at checkout." },
  { title: "Save", text: "Cover up to 15% of any order." },
];

export function TinglePointsGuide() {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-(--pp-line) bg-(--pp-card) p-6">
      <h2 className="text-[15px] font-semibold">How Tingle Points work</h2>
      <ol className="flex flex-col gap-4 text-sm">
        {STEPS.map((step, index: number) => (
          <li key={step.title} className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-primary">
              {index + 1}
            </span>
            <p>
              <b>{step.title}</b>
              <br />
              <span className="text-muted-foreground">{step.text}</span>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
