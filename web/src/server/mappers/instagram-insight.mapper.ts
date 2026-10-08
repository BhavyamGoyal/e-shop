import type { StoredInsight } from "../repositories/instagram.repository";
import {
  AUDIENCE_DIMENSIONS,
  type AccountPoint,
  type AudienceDimension,
  type AudienceSlice,
  type InsightInput,
  type InsightKind,
  type InsightSource,
  type PostRow,
} from "../types/instagram.types";

export const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

export function blankInsight(kind: InsightKind, key: string, date: Date, source: InsightSource): InsightInput {
  return {
    kind,
    key,
    date,
    source,
    followers: 0,
    reach: 0,
    views: 0,
    profileViews: 0,
    websiteClicks: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    caption: "",
    permalink: "",
    mediaType: "",
    dimension: "",
    label: "",
    value: 0,
  };
}

export const toAccountPoint = (row: StoredInsight): AccountPoint => ({
  date: dayKey(new Date(row.date)),
  followers: row.followers,
  reach: row.reach,
  views: row.views,
  profileViews: row.profileViews,
  websiteClicks: row.websiteClicks,
});

export const toPostRow = (row: StoredInsight): PostRow => ({
  id: row._id.toString(),
  date: new Date(row.date).toISOString(),
  caption: row.caption,
  permalink: row.permalink,
  mediaType: row.mediaType,
  likes: row.likes,
  comments: row.comments,
  saves: row.saves,
  shares: row.shares,
  reach: row.reach,
  views: row.views,
});

export const toAudienceSlice = (row: StoredInsight): AudienceSlice => ({
  dimension: row.dimension as AudienceDimension,
  label: row.label,
  value: row.value,
});

export const isAudienceDimension = (value: string): value is AudienceDimension =>
  AUDIENCE_DIMENSIONS.includes(value as AudienceDimension);
