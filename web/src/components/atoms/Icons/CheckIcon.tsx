import { Base, type IconProps } from "@/components/atoms/Icons/IconBase";

export function CheckIcon(props: IconProps) {
  return (
    <Base strokeWidth={3.5} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </Base>
  );
}
