import type { DeliveryPartnerOption, DeliveryQuote } from "../../types/delivery.types";

export abstract class BaseDeliveryPartner {
  abstract readonly id: string;
  abstract readonly name: string;

  protected abstract isServiceable(pincode: string): Promise<boolean>;
  protected abstract transitDays(originPincode: string, destinationPincode: string): Promise<number>;
  protected abstract shippingCharge(originPincode: string, destinationPincode: string, weightGrams: number): Promise<number>;

  option(): DeliveryPartnerOption {
    return { id: this.id, name: this.name };
  }

  async quote(originPincode: string, destinationPincode: string, weightGrams: number): Promise<DeliveryQuote> {
    if (!(await this.isServiceable(destinationPincode))) {
      return { partnerId: this.id, serviceable: false, transitDays: null, charge: 0 };
    }
    const [transitDays, charge]: [number, number] = await Promise.all([
      this.transitDays(originPincode, destinationPincode),
      this.shippingCharge(originPincode, destinationPincode, weightGrams),
    ]);
    return { partnerId: this.id, serviceable: true, transitDays, charge };
  }
}
