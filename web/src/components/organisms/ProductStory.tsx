interface ProductStoryProps {
  html: string;
}

export function ProductStory({ html }: ProductStoryProps) {
  return (
    <section id="story" className="mx-auto w-full max-w-[1280px] scroll-mt-24 px-4 pb-16 md:px-10">
      <div className="mx-auto max-w-[820px] border-t border-(--pp-line-soft) pt-10">
        <p className="mb-5 flex items-center gap-2.5 text-xs font-semibold tracking-[0.26em] text-(--pp-green) uppercase">
          <span className="inline-block h-px w-[30px] bg-(--pp-amber)" />
          About this piece
        </p>
        <div
          className="pdp-prose text-[clamp(15.5px,1.15vw,17px)] leading-[1.75] text-(--pp-ink)"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
