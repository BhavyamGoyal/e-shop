import { Heading } from "../atoms";
import { Card, TokenSwatch } from "../molecules";
import { THEME_TOKENS } from "@/theme";

export function TokenPalette() {
  return (
    <Card className="flex flex-col gap-4">
      <Heading level={3}>Theme tokens</Heading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {THEME_TOKENS.map((token) => (
          <TokenSwatch key={token} token={token} />
        ))}
      </div>
    </Card>
  );
}
