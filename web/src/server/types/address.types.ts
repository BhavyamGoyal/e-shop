export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface AddressInput {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  location: GeoPoint | null;
  isDefault: boolean;
}

export interface AddressRecord extends AddressInput {
  id: string;
  country: string;
}

export interface AddressSnapshot {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: GeoPoint | null;
}
