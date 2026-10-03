import { Swatch, Text } from "../atoms";
import { tokenRef, type ThemeToken } from "@/theme";

export function TokenSwatch({ token }: { token: ThemeToken }) {
  return (
    <div className="flex items-center gap-3">
      <Swatch color={tokenRef(token)} className="size-8 rounded-md" />
      <Text tone="muted" className="font-mono text-xs">
        {token}
      </Text>
    </div>
  );
}
