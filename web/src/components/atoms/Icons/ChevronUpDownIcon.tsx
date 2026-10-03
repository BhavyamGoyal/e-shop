import { Base, type IconProps } from "@/components/atoms/Icons/IconBase";

export function ChevronUpDownIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </Base>
  );
}
