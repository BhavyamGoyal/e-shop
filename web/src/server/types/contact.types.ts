export interface CustomerQueryInput {
  name: string;
  contact: string;
  message: string;
}

export interface StoredQueryInput extends CustomerQueryInput {
  user: string | null;
}

export interface QueryRecord {
  id: string;
  name: string;
  contact: string;
  message: string;
  userName: string;
  createdAt: string;
}
