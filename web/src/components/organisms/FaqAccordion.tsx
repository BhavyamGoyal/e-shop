import type { PublicFaq } from "@/server/types/content.types";

interface FaqAccordionProps {
  faqs: PublicFaq[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq: PublicFaq) => (
        <details key={faq.id} className="group rounded-xl border border-(--pp-line) bg-(--pp-card) px-5 py-4">
          <summary className="cursor-pointer list-none text-base font-semibold text-(--pp-ink) marker:content-none">
            {faq.question}
          </summary>
          <p className="mt-3 leading-relaxed whitespace-pre-line text-(--pp-muted)">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
