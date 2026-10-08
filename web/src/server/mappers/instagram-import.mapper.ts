import type { InsightRow } from "../parsers/insight-rows.parser";
import type { InsightInput, InsightKind } from "../types/instagram.types";
import { blankInsight, dayKey, isAudienceDimension } from "./instagram-insight.mapper";

const ALIASES: Record<string, string[]> = {
  date: ["date", "day", "publishtime", "timestamp", "time", "posttime", "enddate"],
  followers: ["followers", "followercount", "followerscount", "totalfollowers"],
  reach: ["reach", "accountsreached"],
  views: ["views", "impressions", "plays", "videoviews"],
  profileViews: ["profileviews", "profilevisits"],
  websiteClicks: ["websiteclicks", "linkclicks", "externallinktaps"],
  likes: ["likes", "reactions"],
  comments: ["comments"],
  saves: ["saves", "saved"],
  shares: ["shares"],
  id: ["postid", "mediaid", "id"],
  caption: ["description", "caption", "title"],
  permalink: ["permalink", "url", "link"],
  mediaType: ["posttype", "mediatype", "type"],
  dimension: ["dimension", "breakdown", "category"],
  label: ["label", "name", "segment"],
  value: ["value", "count", "percentage"],
};

const pick = (row: InsightRow, field: string): string => {
  const alias: string | undefined = ALIASES[field].find((name: string): boolean => Boolean(row[name]));
  return alias ? row[alias] : "";
};

const toNumber = (raw: string): number => {
  const value: number = Number(raw.replace(/[,%\s]/g, ""));
  return Number.isFinite(value) ? value : 0;
};

const toDate = (raw: string): Date | null => {
  const date: Date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

function mapAccount(row: InsightRow): InsightInput | null {
  const date: Date | null = toDate(pick(row, "date"));
  if (!date) return null;
  const day: Date = new Date(dayKey(date));
  return {
    ...blankInsight("account", dayKey(day), day, "upload"),
    followers: toNumber(pick(row, "followers")),
    reach: toNumber(pick(row, "reach")),
    views: toNumber(pick(row, "views")),
    profileViews: toNumber(pick(row, "profileViews")),
    websiteClicks: toNumber(pick(row, "websiteClicks")),
  };
}

function mapPost(row: InsightRow): InsightInput | null {
  const date: Date | null = toDate(pick(row, "date"));
  const caption: string = pick(row, "caption");
  const key: string = pick(row, "id") || pick(row, "permalink") || (date ? `${dayKey(date)}:${caption.slice(0, 40)}` : "");
  if (!date || !key) return null;
  return {
    ...blankInsight("post", key, date, "upload"),
    caption,
    permalink: pick(row, "permalink"),
    mediaType: pick(row, "mediaType"),
    likes: toNumber(pick(row, "likes")),
    comments: toNumber(pick(row, "comments")),
    saves: toNumber(pick(row, "saves")),
    shares: toNumber(pick(row, "shares")),
    reach: toNumber(pick(row, "reach")),
    views: toNumber(pick(row, "views")),
  };
}

function mapAudience(row: InsightRow): InsightInput | null {
  const dimension: string = pick(row, "dimension").toLowerCase();
  const label: string = pick(row, "label");
  if (!isAudienceDimension(dimension) || !label) return null;
  return {
    ...blankInsight("audience", `${dimension}:${label}`, new Date(), "upload"),
    dimension,
    label,
    value: toNumber(pick(row, "value")),
  };
}

const MAPPERS: Record<InsightKind, (row: InsightRow) => InsightInput | null> = {
  account: mapAccount,
  post: mapPost,
  audience: mapAudience,
};

export const mapRows = (kind: InsightKind, rows: InsightRow[]): InsightInput[] =>
  rows.map(MAPPERS[kind]).filter((input: InsightInput | null): input is InsightInput => input !== null);
