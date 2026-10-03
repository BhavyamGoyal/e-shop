import mongoose from "mongoose";

interface ConnectionCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalScope = globalThis as unknown as {
  mongooseCache?: ConnectionCache;
};

const cache: ConnectionCache = (globalScope.mongooseCache ??= {
  connection: null,
  promise: null,
});

export async function connectDb(): Promise<typeof mongoose> {
  if (cache.connection) return cache.connection;

  const uri: string | undefined = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  cache.promise ??= mongoose.connect(uri, { bufferCommands: false });
  try {
    cache.connection = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  return cache.connection;
}
