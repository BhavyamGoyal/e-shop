import type { DeliveryEstimate, DeliveryPartnerOption } from "../../types/delivery.types";

const DAY_MS = 24 * 60 * 60 * 1000;

export abstract class BaseDeliveryPartner {
  abstract readonly id: string;
  abstract readonly name: string;

  protected abstract isServiceable(pincode: string): Promise<boolean>;
  protected abstract transitDays(originPincode: string, destinationPincode: string): Promise<number>;

  option(): DeliveryPartnerOption {
    return { id: this.id, name: this.name };
  }

  async estimate(originPincode: string, destinationPincode: string): Promise<DeliveryEstimate> {
    if (!(await this.isServiceable(destinationPincode))) {
      return { partnerId: this.id, serviceable: false, days: null, estimatedDate: null };
    }
    const days: number = await this.transitDays(originPincode, destinationPincode);
    const estimatedDate: string = new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
    return { partnerId: this.id, serviceable: true, days, estimatedDate };
  }
}
