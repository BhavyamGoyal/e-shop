export interface DeliveryPartnerOption {
  id: string;
  name: string;
}

export interface DeliveryEstimate {
  partnerId: string;
  serviceable: boolean;
  days: number | null;
  estimatedDate: string | null;
}
