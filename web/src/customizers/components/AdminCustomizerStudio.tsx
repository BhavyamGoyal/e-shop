"use client";

import dynamic from "next/dynamic";
import type { CustomizerRecord } from "@/server/types/customizer.types";

const CustomizerStudio = dynamic(() => import("./CustomizerStudio").then((module) => module.CustomizerStudio), {
  ssr: false,
  loading: () => <p className="py-20 text-center text-muted-foreground">Loading customizer…</p>,
});

export function AdminCustomizerStudio({ customizer }: { customizer: CustomizerRecord }) {
  return <CustomizerStudio customizer={customizer} product={null} editKey={null} />;
}
