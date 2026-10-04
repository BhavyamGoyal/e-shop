export interface CustomerQueryInput {
  name: string;
  contact: string;
  message: string;
}

export interface StoredQueryInput extends CustomerQueryInput {
  user: string | null;
}
