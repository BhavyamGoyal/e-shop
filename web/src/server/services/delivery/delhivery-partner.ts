import { ApiError } from "../../http/errors";
import { BaseDeliveryPartner } from "./base-delivery-partner";

interface PincodeResponse {
  delivery_codes?: { postal_code?: { pre_paid?: string } }[];
}

interface TatResponse {
  success?: boolean;
  data?: { tat?: number };
}

interface ChargeResponseEntry {
  total_amount?: number;
}

const REQUEST_TIMEOUT_MS = 10000;

export class DelhiveryPartner extends BaseDeliveryPartner {
  readonly id = "delhivery";
  readonly name = "Delhivery";

  private async get<T>(path: string): Promise<T> {
    const baseUrl: string | undefined = process.env.DELHIVERY_API_URL;
    const apiKey: string | undefined = process.env.DELHIVERY_API_KEY;
    if (!baseUrl || !apiKey) throw new Error("Delhivery credentials are not set");
    const response: Response = await fetch(`${baseUrl}${path}`, {
      headers: { Authorization: `Token ${apiKey}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    }).catch((): never => {
      throw new ApiError(502, "Delivery partner is unreachable");
    });
    if (!response.ok) throw new ApiError(502, "Delivery partner could not process the request");
    return (await response.json()) as T;
  }

  protected async isServiceable(pincode: string): Promise<boolean> {
    const body: PincodeResponse = await this.get<PincodeResponse>(
      `/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(pincode)}`,
    );
    return (body.delivery_codes ?? []).some((entry): boolean => entry.postal_code?.pre_paid === "Y");
  }

  protected async transitDays(originPincode: string, destinationPincode: string): Promise<number> {
    const query: string = new URLSearchParams({
      origin_pin: originPincode,
      destination_pin: destinationPincode,
      mot: "S",
      pdt: "B2C",
    }).toString();
    const body: TatResponse = await this.get<TatResponse>(`/api/dc/expected_tat?${query}`);
    const days: number | undefined = body.data?.tat;
    if (typeof days !== "number") throw new ApiError(502, "Delivery partner returned no estimate");
    return days;
  }

  protected async shippingCharge(originPincode: string, destinationPincode: string, weightGrams: number): Promise<number> {
    const query: string = new URLSearchParams({
      md: "S",
      ss: "Delivered",
      o_pin: originPincode,
      d_pin: destinationPincode,
      cgm: String(weightGrams),
      pt: "Pre-paid",
    }).toString();
    const body: ChargeResponseEntry[] = await this.get<ChargeResponseEntry[]>(`/api/kinko/v1/invoice/charges/.json?${query}`);
    const amount: number | undefined = body[0]?.total_amount;
    if (typeof amount !== "number") throw new ApiError(502, "Delivery partner returned no shipping cost");
    return Math.round(amount * 100);
  }
}
