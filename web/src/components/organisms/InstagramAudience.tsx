import { AUDIENCE_DIMENSIONS, type AudienceDimension, type AudienceSlice } from "@/server/types/instagram.types";
import { Heading, Text } from "../atoms";
import { BarList } from "../molecules";

const TITLES: Record<AudienceDimension, string> = {
  age: "Age",
  gender: "Gender",
  city: "Top cities",
  country: "Top countries",
};

export function InstagramAudience({ audience }: { audience: AudienceSlice[] }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level={3}>Audience</Heading>
      {audience.length === 0 ? (
        <Text tone="muted">Demographics appear once Instagram has enough followers to report them.</Text>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {AUDIENCE_DIMENSIONS.map((dimension: AudienceDimension) => {
          const items = audience.filter((slice: AudienceSlice): boolean => slice.dimension === dimension);
          return items.length > 0 ? <BarList key={dimension} title={TITLES[dimension]} items={items} /> : null;
        })}
      </div>
    </section>
  );
}
