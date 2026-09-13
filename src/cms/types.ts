import type { D1Database, R2Bucket, KVNamespace, VectorizeIndex } from '@cloudflare/workers-types'

export interface Bindings {
  // Database & Storage
  DB: D1Database;
  MY_BUCKET?: R2Bucket;
  MEDIA_BUCKET?: R2Bucket;
  BUCKET?: R2Bucket;
  R2?: R2Bucket;
  QURAN_CACHE?: KVNamespace;

  // Cross-Account Cloudflare R2 (S3 API)
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;

  // AI & Vector Search
  AI: any;
  sa_cache?: KVNamespace;
  VECTORIZE_INDEX?: VectorizeIndex; // Untuk Tarjih CMS
  VECTOR_INDEX?: VectorizeIndex;   // Untuk Quran (Opsional)
}

export type Content = {
  id: number;
  slug: string;
  title: string;
  body: string;
  type: string;
  status: string;
  attributes?: string;
}