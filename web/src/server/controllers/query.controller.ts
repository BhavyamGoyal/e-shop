import { isValidObjectId } from "mongoose";
import { requireStaff } from "../auth/guard";
import { readSession, type Session } from "../auth/session";
import { ValidationError } from "../http/errors";
import { queryRepository, type StoredQuery } from "../repositories/query.repository";
import type { CustomerQueryInput, QueryRecord } from "../types/contact.types";

const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN: RegExp = /^\+?\d{10,15}$/;
const MAX_NAME: number = 100;
const MAX_MESSAGE: number = 2000;

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const isValidContact = (contact: string): boolean =>
  EMAIL_PATTERN.test(contact) || PHONE_PATTERN.test(contact.replace(/[\s-]/g, ""));

function parseInput(payload: unknown): CustomerQueryInput {
  const raw = (payload ?? {}) as Record<string, unknown>;
  const name: string = text(raw.name);
  const contact: string = text(raw.contact);
  const message: string = text(raw.message);
  if (!name) throw new ValidationError("Name is required");
  if (name.length > MAX_NAME) throw new ValidationError("Name is too long");
  if (!contact) throw new ValidationError("Mobile number or email is required");
  if (!isValidContact(contact)) throw new ValidationError("Enter a valid mobile number or email");
  if (!message) throw new ValidationError("Message is required");
  if (message.length > MAX_MESSAGE) throw new ValidationError("Message is too long");
  return { name, contact, message };
}

const toRecord = (query: StoredQuery): QueryRecord => ({
  id: query._id.toString(),
  name: query.name,
  contact: query.contact,
  message: query.message,
  userName: query.user?.name ?? "",
  createdAt: new Date(query.createdAt).toISOString(),
});

export const queryController = {
  async list(): Promise<QueryRecord[]> {
    await requireStaff();
    return (await queryRepository.list()).map(toRecord);
  },

  async submit(payload: unknown): Promise<void> {
    const input: CustomerQueryInput = parseInput(payload);
    const session: Session | null = await readSession();
    const user: string | null = session && isValidObjectId(session.userId) ? session.userId : null;
    await queryRepository.create({ ...input, user });
  },
};
