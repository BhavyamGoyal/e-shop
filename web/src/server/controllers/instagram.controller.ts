import { requireAdmin, requireStaff } from "../auth/guard";
import { ValidationError } from "../http/errors";
import { mapRows } from "../mappers/instagram-import.mapper";
import { toAccountPoint, toAudienceSlice, toPostRow } from "../mappers/instagram-insight.mapper";
import { parseInsightRows } from "../parsers/insight-rows.parser";
import { instagramRepository } from "../repositories/instagram.repository";
import { readCredentials, type GraphCredentials } from "../services/instagram-graph.client";
import { fetchAccountSnapshot, fetchAudience, fetchPostInsights } from "../services/instagram-graph.service";
import {
  INSIGHT_KINDS,
  type ImportFormat,
  type ImportRequest,
  type ImportResult,
  type InsightInput,
  type InsightKind,
  type InstagramDashboard,
} from "../types/instagram.types";

const FORMATS: ImportFormat[] = ["csv", "json"];
const MAX_CONTENT: number = 5_000_000;

function parseRequest(payload: unknown): ImportRequest {
  const raw = (payload ?? {}) as Record<string, unknown>;
  const kind = raw.kind as InsightKind;
  const format = raw.format as ImportFormat;
  const content: string = typeof raw.content === "string" ? raw.content : "";
  if (!INSIGHT_KINDS.includes(kind)) throw new ValidationError("Choose what the file contains");
  if (!FORMATS.includes(format)) throw new ValidationError("Upload a .csv or .json file");
  if (!content.trim()) throw new ValidationError("The file is empty");
  if (content.length > MAX_CONTENT) throw new ValidationError("The file is too large");
  return { kind, format, content };
}

async function store(kind: InsightKind, inputs: InsightInput[]): Promise<ImportResult> {
  if (inputs.length === 0) throw new ValidationError("No usable rows found. Check the column headers.");
  await instagramRepository.save(kind, inputs);
  return { imported: inputs.length };
}

export const instagramController = {
  async dashboard(): Promise<InstagramDashboard> {
    await requireStaff();
    const [account, posts, audience] = await Promise.all([
      instagramRepository.listByKind("account"),
      instagramRepository.listByKind("post"),
      instagramRepository.listByKind("audience"),
    ]);
    return {
      account: account.map(toAccountPoint),
      posts: posts.map(toPostRow),
      audience: audience.map(toAudienceSlice),
      apiConfigured: readCredentials() !== null,
    };
  },

  async importFile(payload: unknown): Promise<ImportResult> {
    await requireAdmin();
    const { kind, format, content } = parseRequest(payload);
    return store(kind, mapRows(kind, parseInsightRows(format, content)));
  },

  async sync(): Promise<ImportResult> {
    await requireAdmin();
    const credentials: GraphCredentials | null = readCredentials();
    if (!credentials) throw new ValidationError("Set INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN to enable sync");
    const [account, posts, audience] = await Promise.all([
      fetchAccountSnapshot(credentials),
      fetchPostInsights(credentials),
      fetchAudience(credentials),
    ]);
    await instagramRepository.save("account", [account]);
    if (posts.length > 0) await instagramRepository.save("post", posts);
    if (audience.length > 0) await instagramRepository.save("audience", audience);
    return { imported: 1 + posts.length + audience.length };
  },
};
