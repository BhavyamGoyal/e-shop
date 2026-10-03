import type { SpinnerSize } from "@/components/atoms/Feedback/Spinner.types";

export type LoaderSize = SpinnerSize;

export interface LoaderProps {
  size?: LoaderSize;
  label?: string;
  className?: string;
}
