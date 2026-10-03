import { Base, type IconProps } from "@/components/atoms/Icons/IconBase";

export function GripVerticalIcon(props: IconProps) {
  return (
    <Base fill="currentColor" stroke="none" {...props}>
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </Base>
  );
}
