const DEDUPE_MS: number = 2000;

const inflight = new Map<string, Promise<void>>();

export const isFresh = (at: number): boolean => Date.now() - at < DEDUPE_MS;

export const hasData = (at: number): boolean => at > 0;

export function once(key: string, task: () => Promise<void>): Promise<void> {
  const running: Promise<void> | undefined = inflight.get(key);
  if (running) return running;
  const started: Promise<void> = task().finally((): void => {
    inflight.delete(key);
  });
  inflight.set(key, started);
  return started;
}
