import { Badge, Button, Heading, type Tone } from "../atoms";
import { Card, FormField } from "../molecules";

const tones: readonly Tone[] = [
  "primary",
  "secondary",
  "accent",
  "success",
  "warning",
  "danger",
];

export function ComponentShowcase() {
  return (
    <Card className="flex flex-col gap-6">
      <Heading level={3}>Components</Heading>
      <div className="flex flex-wrap gap-2">
        {tones.map((tone) => (
          <Button key={tone} tone={tone}>
            {tone}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {tones.map((tone) => (
          <Button key={tone} tone={tone} variant="outline">
            {tone}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {tones.map((tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
      </div>
      <FormField id="email" label="Email" type="email" placeholder="you@example.com" hint="We never share your email." />
    </Card>
  );
}
