import { fetchAddresses } from "@/lib/address-api";
import { isFresh, once } from "@/lib/account-cache";
import { AuthRequiredError } from "@/lib/api-request";
import { fetchOrders } from "@/lib/order-api";
import { fetchProfile } from "@/lib/profile-api";
import { useAccountStore } from "@/stores/account/Account.store";
import type { AccountState } from "@/stores/account/Account.types";

const state = (): AccountState => useAccountStore.getState();

async function guarded(task: () => Promise<void>): Promise<void> {
  try {
    await task();
  } catch (failure) {
    if (failure instanceof AuthRequiredError) state().reset();
    throw failure;
  }
}

export const loadProfile = (): Promise<void> => {
  if (state().profile && isFresh(state().profileAt)) return Promise.resolve();
  return once("profile", async (): Promise<void> => {
    try {
      const loaded = await fetchProfile();
      if (loaded) state().setProfile(loaded);
      else state().reset();
    } catch {
      return;
    }
  });
};

export const loadOrders = (): Promise<void> => {
  if (isFresh(state().ordersAt)) return Promise.resolve();
  return once("orders", (): Promise<void> => guarded(async (): Promise<void> => state().setOrders(await fetchOrders())));
};

export const loadAddresses = (force: boolean = false): Promise<void> => {
  if (!force && isFresh(state().addressesAt)) return Promise.resolve();
  return once("addresses", (): Promise<void> => guarded(async (): Promise<void> => state().setAddresses(await fetchAddresses())));
};

export const loadBalance = (): Promise<void> => {
  if (isFresh(state().balanceAt)) return Promise.resolve();
  return once("balance", async (): Promise<void> => {
    try {
      const response: Response = await fetch("/api/tingle-points");
      if (response.status === 401) state().reset();
      else if (response.ok) state().setBalance(((await response.json()) as { balance: number }).balance);
    } catch {
      return;
    }
  });
};
