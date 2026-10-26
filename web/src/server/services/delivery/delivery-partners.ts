import type { BaseDeliveryPartner } from "./base-delivery-partner";
import { DelhiveryPartner } from "./delhivery-partner";

const PARTNERS: BaseDeliveryPartner[] = [new DelhiveryPartner()];

export const deliveryPartners = (): BaseDeliveryPartner[] => PARTNERS;

export const findDeliveryPartner = (id: string): BaseDeliveryPartner | undefined =>
  PARTNERS.find((partner: BaseDeliveryPartner): boolean => partner.id === id);
