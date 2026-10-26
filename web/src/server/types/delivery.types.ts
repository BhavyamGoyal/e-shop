export interface DeliveryPartnerOption {
  id: string;
  name: string;
}

export interface DeliveryQuote {
  partnerId: string;
  serviceable: boolean;
  transitDays: number | null;
  charge: number;
}

export interface DeliveryEstimate extends DeliveryQuote {
  manufacturingDays: number;
  estimatedDate: string | null;
}

export interface OrderDelivery {
  partnerId: string;
  manufacturingDays: number;
  transitDays: number;
  estimatedDate: string;
}
