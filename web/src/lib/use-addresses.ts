import { useCallback, useEffect, useState } from "react";
import { AuthRequiredError } from "@/lib/api-request";
import { deleteAddress, fetchAddresses, saveAddress } from "@/lib/address-api";
import type { AddressInput, AddressRecord } from "@/server/types/address.types";

export interface AddressesState {
  addresses: AddressRecord[];
  loading: boolean;
  authRequired: boolean;
  error: string;
  save: (id: string | null, input: AddressInput) => Promise<AddressRecord>;
  remove: (id: string) => Promise<void>;
  makeDefault: (address: AddressRecord) => Promise<void>;
}

export function useAddresses(): AddressesState {
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authRequired, setAuthRequired] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fail = useCallback((failure: unknown): void => {
    if (failure instanceof AuthRequiredError) setAuthRequired(true);
    else setError(failure instanceof Error ? failure.message : "Could not load addresses");
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    try {
      setAddresses(await fetchAddresses());
      setError("");
    } catch (failure) {
      fail(failure);
    }
  }, [fail]);

  useEffect((): void => {
    fetchAddresses()
      .then(setAddresses)
      .catch(fail)
      .finally((): void => setLoading(false));
  }, [fail]);

  const save = async (id: string | null, input: AddressInput): Promise<AddressRecord> => {
    const saved: AddressRecord = await saveAddress(id, input);
    await reload();
    return saved;
  };

  const remove = async (id: string): Promise<void> => {
    try {
      await deleteAddress(id);
      await reload();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not delete address");
    }
  };

  const makeDefault = async (address: AddressRecord): Promise<void> => {
    try {
      await saveAddress(address.id, { ...address, isDefault: true });
      await reload();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not update address");
    }
  };

  return { addresses, loading, authRequired, error, save, remove, makeDefault };
}
