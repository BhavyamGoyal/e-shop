import { faqRepository, type StoredFaq } from "../repositories/faq.repository";
import type { PublicFaq } from "../types/content.types";

const toPublic = (faq: StoredFaq): PublicFaq => ({ id: faq._id.toString(), question: faq.question, answer: faq.answer });

export const storefrontFaqs = {
  async home(): Promise<PublicFaq[]> {
    return (await faqRepository.listPublishedForHome()).map(toPublic);
  },

  async general(): Promise<PublicFaq[]> {
    return (await faqRepository.listPublishedGeneral()).map(toPublic);
  },
};
