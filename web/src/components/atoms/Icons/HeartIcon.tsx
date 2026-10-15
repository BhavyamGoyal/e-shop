import { Base, type IconProps } from "@/components/atoms/Icons/IconBase";

export function HeartIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12.1 21.35l-1.1-1.02C5.14 15.36 2 12.5 2 8.99 2 6.1 4.24 4 7.05 4c1.6 0 3.14.75 4.15 1.94A5.4 5.4 0 0 1 15.35 4C18.16 4 20.4 6.1 20.4 8.99c0 3.51-3.14 6.37-8.99 11.35l-1.1 1.01z" />
    </Base>
  );
}
