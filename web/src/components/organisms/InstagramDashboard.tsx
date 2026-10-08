"use client";

import { useInstagram } from "@/lib/use-instagram";
import type { AccountPoint } from "@/server/types/instagram.types";
import { Heading, Text } from "../atoms";
import { AlertMessage, MetricCard, TrendChart } from "../molecules";
import { InstagramAudience } from "./InstagramAudience";
import { InstagramImport } from "./InstagramImport";
import { InstagramPostsTable } from "./InstagramPostsTable";

type NumericKey = Exclude<keyof AccountPoint, "date">;

const TRENDS: { key: NumericKey; title: string }[] = [
  { key: "followers", title: "Followers" },
  { key: "reach", title: "Reach" },
  { key: "views", title: "Views" },
  { key: "profileViews", title: "Profile views" },
  { key: "websiteClicks", title: "Website clicks" },
];

const total = (account: AccountPoint[], key: NumericKey): number =>
  account.reduce((sum: number, point: AccountPoint): number => sum + point[key], 0);

export function InstagramDashboard() {
  const { data, loading, busy, error, notice, upload, sync } = useInstagram();
  const account: AccountPoint[] = data?.account ?? [];
  const followers: number = account[account.length - 1]?.followers ?? 0;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Heading level={2}>Instagram</Heading>
        <Text tone="muted" className="text-sm">
          {account.length} days tracked, {data?.posts.length ?? 0} posts
        </Text>
      </div>
      {error ? <AlertMessage tone="danger" message={error} /> : null}
      {notice ? <AlertMessage tone="success" message={notice} /> : null}
      {loading ? <Text tone="muted">Loading...</Text> : null}
      {data ? (
        <>
          <InstagramImport busy={busy} apiConfigured={data.apiConfigured} onUpload={upload} onSync={sync} />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <MetricCard label="Followers" value={followers} />
            <MetricCard label="Total reach" value={total(account, "reach")} />
            <MetricCard label="Total views" value={total(account, "views")} />
            <MetricCard label="Profile views" value={total(account, "profileViews")} />
            <MetricCard label="Website clicks" value={total(account, "websiteClicks")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TRENDS.map((trend) => (
              <TrendChart
                key={trend.key}
                title={trend.title}
                points={account.map((point: AccountPoint) => ({ label: point.date, value: point[trend.key] }))}
              />
            ))}
          </div>
          <InstagramPostsTable posts={data.posts} />
          <InstagramAudience audience={data.audience} />
        </>
      ) : null}
    </section>
  );
}
