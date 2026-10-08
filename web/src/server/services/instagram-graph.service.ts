import { blankInsight, dayKey } from "../mappers/instagram-insight.mapper";
import { AUDIENCE_DIMENSIONS, type InsightInput } from "../types/instagram.types";
import { graphGet, type GraphCredentials } from "./instagram-graph.client";

const MEDIA_LIMIT: number = 25;
const ACCOUNT_METRICS: string = "reach,views,profile_views,website_clicks";
const MEDIA_METRICS: string = "reach,saved,shares,views";

interface TotalValueMetric {
  name: string;
  values?: { value: number }[];
  total_value?: { value?: number; breakdowns?: { results?: { dimension_values: string[]; value: number }[] }[] };
}

interface InsightsResponse {
  data: TotalValueMetric[];
}

interface MediaItem {
  id: string;
  caption?: string;
  media_type?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

const metricMap = (response: InsightsResponse): Record<string, number> =>
  Object.fromEntries(response.data.map((metric: TotalValueMetric): [string, number] => [metric.name, metric.total_value?.value ?? 0]));

export async function fetchAccountSnapshot({ userId, token }: GraphCredentials): Promise<InsightInput> {
  const [profile, insights] = await Promise.all([
    graphGet<{ followers_count?: number }>(userId, { fields: "followers_count" }, token),
    graphGet<InsightsResponse>(`${userId}/insights`, { metric: ACCOUNT_METRICS, metric_type: "total_value", period: "day" }, token),
  ]);
  const metrics: Record<string, number> = metricMap(insights);
  const today: Date = new Date(dayKey(new Date()));
  return {
    ...blankInsight("account", dayKey(today), today, "api"),
    followers: profile.followers_count ?? 0,
    reach: metrics.reach ?? 0,
    views: metrics.views ?? 0,
    profileViews: metrics.profile_views ?? 0,
    websiteClicks: metrics.website_clicks ?? 0,
  };
}

async function mediaMetrics(media: MediaItem, token: string): Promise<Record<string, number>> {
  try {
    const response: InsightsResponse = await graphGet<InsightsResponse>(`${media.id}/insights`, { metric: MEDIA_METRICS }, token);
    return Object.fromEntries(
      response.data.map((metric: TotalValueMetric): [string, number] => [metric.name, metric.values?.[0]?.value ?? 0]),
    );
  } catch {
    return {};
  }
}

export async function fetchPostInsights({ userId, token }: GraphCredentials): Promise<InsightInput[]> {
  const fields: string = "id,caption,media_type,permalink,timestamp,like_count,comments_count";
  const media: { data: MediaItem[] } = await graphGet(`${userId}/media`, { fields, limit: String(MEDIA_LIMIT) }, token);
  return Promise.all(
    media.data.map(async (item: MediaItem): Promise<InsightInput> => {
      const metrics: Record<string, number> = await mediaMetrics(item, token);
      return {
        ...blankInsight("post", item.id, new Date(item.timestamp), "api"),
        caption: item.caption ?? "",
        permalink: item.permalink ?? "",
        mediaType: item.media_type ?? "",
        likes: item.like_count ?? 0,
        comments: item.comments_count ?? 0,
        saves: metrics.saved ?? 0,
        shares: metrics.shares ?? 0,
        reach: metrics.reach ?? 0,
        views: metrics.views ?? 0,
      };
    }),
  );
}

export async function fetchAudience({ userId, token }: GraphCredentials): Promise<InsightInput[]> {
  const now: Date = new Date();
  const groups: InsightInput[][] = await Promise.all(
    AUDIENCE_DIMENSIONS.map(async (dimension: string): Promise<InsightInput[]> => {
      try {
        const params: Record<string, string> = { metric: "follower_demographics", period: "lifetime", metric_type: "total_value", breakdown: dimension };
        const response: InsightsResponse = await graphGet<InsightsResponse>(`${userId}/insights`, params, token);
        const results = response.data[0]?.total_value?.breakdowns?.[0]?.results ?? [];
        return results.map((result): InsightInput => ({
          ...blankInsight("audience", `${dimension}:${result.dimension_values.join(" ")}`, now, "api"),
          dimension,
          label: result.dimension_values.join(" "),
          value: result.value,
        }));
      } catch {
        return [];
      }
    }),
  );
  return groups.flat();
}
