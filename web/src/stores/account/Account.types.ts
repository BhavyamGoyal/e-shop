import type { AddressRecord } from "@/server/types/address.types";
import type { OrderDetail } from "@/server/types/order-view.types";

export interface Profile {
  name: string;
  email: string;
  image: string;
}

export interface AccountData {
  profile: Profile | null;
  profileAt: number;
  orders: OrderDetail[];
  ordersAt: number;
  balance: number;
  balanceAt: number;
  addresses: AddressRecord[];
  addressesAt: number;
}

export interface AccountState extends AccountData {
  setProfile: (profile: Profile) => void;
  setOrders: (orders: OrderDetail[]) => void;
  setBalance: (balance: number) => void;
  setAddresses: (addresses: AddressRecord[]) => void;
  invalidate: () => void;
  reset: () => void;
}
