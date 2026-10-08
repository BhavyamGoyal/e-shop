export type InsightKind = "account" | "post" | "audience";
export type InsightSource = "upload" | "api";
export type ImportFormat = "csv" | "json";
export type AudienceDimension = "age" | "gender" | "city" | "country";

export const INSIGHT_KINDS: InsightKind[] = ["account", "post", "audience"];
export const AUDIENCE_DIMENSIONS: AudienceDimension[] = ["age", "gender", "city", "country"];

export interface InsightInput {
  kind: InsightKind;
  key: string;
  date: Date;
  source: InsightSource;
  followers: number;
  reach: number;
  views: number;
  profileViews: number;
  websiteClicks: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  caption: string;
  permalink: string;
  mediaType: string;
  dimension: string;
  label: string;
  value: number;
}

export interface ImportRequest {
  kind: InsightKind;
  format: ImportFormat;
  content: string;
}

export interface ImportResult {
  imported: number;
}

export interface AccountPoint {
  date: string;
  followers: number;
  reach: number;
  views: number;
  profileViews: number;
  websiteClicks: number;
}

export interface PostRow {
  id: string;
  date: string;
  caption: string;
  permalink: string;
  mediaType: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
  views: number;
}

export interface AudienceSlice {
  dimension: AudienceDimension;
  label: string;
  value: number;
}

export interface InstagramDashboard {
  account: AccountPoint[];
  posts: PostRow[];
  audience: AudienceSlice[];
  apiConfigured: boolean;
}
