"use client";

import Clarity from "@microsoft/clarity";
import { useEffect } from "react";

const CLARITY_PROJECT_ID = "ytlyyasx6s";

export function ClarityAnalytics(): null {
  useEffect((): void => {
    Clarity.init(CLARITY_PROJECT_ID);
  }, []);

  return null;
}
