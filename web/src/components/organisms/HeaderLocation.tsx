"use client";

import { useEffect, useState } from "react";
import { fetchAddresses } from "@/lib/address-api";
import { fetchProfile } from "@/lib/profile-api";
import type { HeaderData } from "@/lib/website-data";
import type { AddressRecord } from "@/server/types/address.types";

interface HeaderLocationProps {
  location: HeaderData["location"];
}

const pickPincode = (addresses: AddressRecord[]): string =>
  (addresses.find((address: AddressRecord): boolean => address.isDefault) ?? addresses[0])?.postalCode ?? "";

export function HeaderLocation({ location }: HeaderLocationProps) {
  const [pincode, setPincode] = useState<string>("");

  useEffect((): void => {
    fetchProfile()
      .then((profile) => (profile ? fetchAddresses() : []))
      .then((addresses: AddressRecord[]): void => setPincode(pickPincode(addresses)))
      .catch((): void => setPincode(""));
  }, []);

  return (
    <div className="hidden min-w-[170px] cursor-pointer items-center gap-2 lg:flex">
      <img src={location.icon} alt="location" width={24} height={24} />
      {pincode ? (
        <div className="flex items-center gap-1 text-base font-semibold text-foreground">
          Delivering to {pincode}
          <img src={location.chevron} alt="" width={14} height={14} />
        </div>
      ) : (
        <div>
          <div className="text-base font-semibold text-foreground">{location.title}</div>
          <div className="flex items-center gap-1 text-xs font-medium text-danger">
            {location.status}
            <img src={location.chevron} alt="" width={14} height={14} />
          </div>
        </div>
      )}
    </div>
  );
}
