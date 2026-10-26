import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AccountData, AccountState } from "@/stores/account/Account.types";

const EMPTY: AccountData = {
  profile: null,
  profileAt: 0,
  orders: [],
  ordersAt: 0,
  balance: 0,
  balanceAt: 0,
  addresses: [],
  addressesAt: 0,
};

const STALE = { profileAt: 0, ordersAt: 0, balanceAt: 0, addressesAt: 0 };

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      ...EMPTY,
      setProfile: (profile): void => {
        set({ profile, profileAt: Date.now() });
      },
      setOrders: (orders): void => {
        set({ orders, ordersAt: Date.now() });
      },
      setBalance: (balance): void => {
        set({ balance, balanceAt: Date.now() });
      },
      setAddresses: (addresses): void => {
        set({ addresses, addressesAt: Date.now() });
      },
      invalidate: (): void => {
        set(STALE);
      },
      reset: (): void => {
        set(EMPTY);
      },
    }),
    {
      name: "tinglet-account",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: AccountState): AccountData => ({
        profile: state.profile,
        profileAt: state.profileAt,
        orders: state.orders,
        ordersAt: state.ordersAt,
        balance: state.balance,
        balanceAt: state.balanceAt,
        addresses: state.addresses,
        addressesAt: state.addressesAt,
      }),
    },
  ),
);
