/**
 * Cloudflare R2 Storage Adapter (Cross-Account S3 & Native Binding)
 *
 * Mendukung akses R2 Bucket di akun Cloudflare yang berbeda via S3 API (aws4fetch).
 * Jika variabel lingkungan R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 * tidak tersedia, adapter secara otomatis fallback ke binding native Cloudflare
 * (c.env.MEDIA_BUCKET || c.env.BUCKET || c.env.MY_BUCKET || c.env.R2).
 */

import { AwsClient } from "aws4fetch";

export interface S3R2AdapterConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export class S3R2BucketAdapter {
  private client: AwsClient;
  private accountId: string;
  private bucketName: string;

  constructor(config: S3R2AdapterConfig) {
    this.accountId = config.accountId.trim();
    this.bucketName = config.bucketName.trim();
    this.client = new AwsClient({
      accessKeyId: config.accessKeyId.trim(),
      secretAccessKey: config.secretAccessKey.trim(),
      service: "s3",
      region: "auto",
    });
  }

  private buildObjectUrl(key: string): string {
    const cleanKey = key.startsWith("/") ? key.slice(1) : key;
    const encodedKey = cleanKey
      .split("/")
      .map(part => encodeURIComponent(part))
      .join("/");
    return `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}/${encodedKey}`;
  }

  private extractMetadata(headers: Headers): R2HTTPMetadata {
    return {
      contentType: headers.get("content-type") || undefined,
      contentLanguage: headers.get("content-language") || undefined,
      contentDisposition: headers.get("content-disposition") || undefined,
      contentEncoding: headers.get("content-encoding") || undefined,
      cacheControl: headers.get("cache-control") || undefined,
      cacheExpiry: headers.get("expires")
        ? new Date(headers.get("expires")!)
        : undefined,
    };
  }

  /**
   * Mengambil objek dari R2 via S3 GET (mendukung Range request HTTP 206)
   */
  async get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null> {
    const url = this.buildObjectUrl(key);
    const headers: Record<string, string> = {};

    if (options?.range) {
      const r = options.range;
      if (r.offset !== undefined && r.length !== undefined) {
        headers["Range"] = `bytes=${r.offset}-${r.offset + r.length - 1}`;
      } else if (r.offset !== undefined) {
        headers["Range"] = `bytes=${r.offset}-`;
      } else if (r.suffix !== undefined) {
        headers["Range"] = `bytes=-${r.suffix}`;
      }
    }

    const res = await this.client.fetch(url, {
      method: "GET",
      headers,
    });

    if (res.status === 404 || !res.ok) {
      return null;
    }

    const etag = (res.headers.get("etag") || "").replace(/"/g, "");
    const httpMetadata = this.extractMetadata(res.headers);

    let totalSize = Number(res.headers.get("content-length") || 0);
    let rangeResult: { offset: number; length: number } | undefined = undefined;

    if (res.status === 206) {
      const contentRange = res.headers.get("content-range");
      if (contentRange) {
        const match = contentRange.match(/bytes\s+(\d+)-(\d+)\/(\d+|\*)/);
        if (match) {
          const start = parseInt(match[1], 10);
          const end = parseInt(match[2], 10);
          rangeResult = { offset: start, length: end - start + 1 };
          if (match[3] !== "*") {
            totalSize = parseInt(match[3], 10);
          }
        }
      }
    }

    const objBody: any = {
      key,
      version: etag,
      size: totalSize,
      etag,
      httpEtag: `"${etag}"`,
      uploaded: new Date(res.headers.get("last-modified") || Date.now()),
      httpMetadata,
      customMetadata: {},
      body: res.body,
      bodyUsed: false,
      range: rangeResult,
      writeHttpMetadata(h: Headers) {
        if (httpMetadata.contentType)
          h.set("content-type", httpMetadata.contentType);
        if (httpMetadata.contentLanguage)
          h.set("content-language", httpMetadata.contentLanguage);
        if (httpMetadata.contentDisposition)
          h.set("content-disposition", httpMetadata.contentDisposition);
        if (httpMetadata.contentEncoding)
          h.set("content-encoding", httpMetadata.contentEncoding);
        if (httpMetadata.cacheControl)
          h.set("cache-control", httpMetadata.cacheControl);
        if (httpMetadata.cacheExpiry)
          h.set("expires", httpMetadata.cacheExpiry.toUTCString());
      },
      async arrayBuffer(): Promise<ArrayBuffer> {
        return await res.arrayBuffer();
      },
      async text(): Promise<string> {
        return await res.text();
      },
      async json<T = unknown>(): Promise<T> {
        return (await res.json()) as T;
      },
      async blob(): Promise<Blob> {
        return await res.blob();
      },
    };

    return objBody as R2ObjectBody;
  }

  /**
   * Mengambil metadata objek tanpa mengunduh body (S3 HEAD)
   */
  async head(key: string): Promise<R2Object | null> {
    const url = this.buildObjectUrl(key);
    const res = await this.client.fetch(url, {
      method: "HEAD",
    });

    if (res.status === 404 || !res.ok) {
      return null;
    }

    const etag = (res.headers.get("etag") || "").replace(/"/g, "");
    const httpMetadata = this.extractMetadata(res.headers);
    const size = Number(res.headers.get("content-length") || 0);

    const obj: any = {
      key,
      version: etag,
      size,
      etag,
      httpEtag: `"${etag}"`,
      uploaded: new Date(res.headers.get("last-modified") || Date.now()),
      httpMetadata,
      customMetadata: {},
      writeHttpMetadata(h: Headers) {
        if (httpMetadata.contentType)
          h.set("content-type", httpMetadata.contentType);
        if (httpMetadata.contentLanguage)
          h.set("content-language", httpMetadata.contentLanguage);
        if (httpMetadata.contentDisposition)
          h.set("content-disposition", httpMetadata.contentDisposition);
        if (httpMetadata.contentEncoding)
          h.set("content-encoding", httpMetadata.contentEncoding);
        if (httpMetadata.cacheControl)
          h.set("cache-control", httpMetadata.cacheControl);
        if (httpMetadata.cacheExpiry)
          h.set("expires", httpMetadata.cacheExpiry.toUTCString());
      },
    };

    return obj as R2Object;
  }

  /**
   * Mengunggah berkas ke R2 via S3 PUT
   */
  async put(
    key: string,
    value:
      ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
    options?: R2PutOptions
  ): Promise<R2Object | null> {
    const url = this.buildObjectUrl(key);
    const headers: Record<string, string> = {};

    if (options?.httpMetadata?.contentType) {
      headers["Content-Type"] = options.httpMetadata.contentType;
    } else {
      headers["Content-Type"] = "application/octet-stream";
    }

    if (options?.httpMetadata?.cacheControl) {
      headers["Cache-Control"] = options.httpMetadata.cacheControl;
    }
    if (options?.httpMetadata?.contentDisposition) {
      headers["Content-Disposition"] = options.httpMetadata.contentDisposition;
    }
    if (options?.httpMetadata?.contentEncoding) {
      headers["Content-Encoding"] = options.httpMetadata.contentEncoding;
    }
    if (options?.httpMetadata?.contentLanguage) {
      headers["Content-Language"] = options.httpMetadata.contentLanguage;
    }

    if (options?.customMetadata) {
      for (const [k, v] of Object.entries(options.customMetadata)) {
        headers[`x-amz-meta-${k.toLowerCase()}`] = String(v);
      }
    }

    const res = await this.client.fetch(url, {
      method: "PUT",
      headers,
      body: value as any,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `S3 PUT (${key}) gagal dengan status ${res.status}: ${errText}`
      );
    }

    const etag = (res.headers.get("etag") || "").replace(/"/g, "");
    const meta = options?.httpMetadata || {};

    const obj: any = {
      key,
      version: etag,
      size: 0,
      etag,
      httpEtag: `"${etag}"`,
      uploaded: new Date(),
      httpMetadata: meta,
      customMetadata: options?.customMetadata || {},
      writeHttpMetadata(h: Headers) {
        if (meta.contentType) h.set("content-type", meta.contentType);
      },
    };

    return obj as R2Object;
  }

  /**
   * Menghapus satu atau banyak berkas dari R2 via S3 DELETE
   */
  async delete(keys: string | string[]): Promise<void> {
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) {
      const url = this.buildObjectUrl(key);
      await this.client.fetch(url, {
        method: "DELETE",
      });
    }
  }

  /**
   * Mendapatkan daftar berkas dari R2 via S3 ListObjectsV2
   */
  async list(options?: R2ListOptions): Promise<R2Objects> {
    const params = new URLSearchParams({ "list-type": "2" });
    if (options?.prefix) params.set("prefix", options.prefix);
    if (options?.limit) params.set("max-keys", String(options.limit));
    if (options?.cursor) params.set("continuation-token", options.cursor);
    if (options?.delimiter) params.set("delimiter", options.delimiter);

    const url = `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}?${params.toString()}`;
    const res = await this.client.fetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`S3 LIST gagal dengan status ${res.status}: ${errText}`);
    }

    const xml = await res.text();
    const objects: R2Object[] = [];
    const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
    let match: RegExpExecArray | null;

    while ((match = contentsRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const keyMatch = /<Key>(.*?)<\/Key>/.exec(itemXml);
      const sizeMatch = /<Size>(.*?)<\/Size>/.exec(itemXml);
      const dateMatch = /<LastModified>(.*?)<\/LastModified>/.exec(itemXml);
      const etagMatch = /<ETag>(.*?)<\/ETag>/.exec(itemXml);

      if (keyMatch) {
        const key = keyMatch[1];
        const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
        const uploaded = dateMatch ? new Date(dateMatch[1]) : new Date();
        const etag = etagMatch ? etagMatch[1].replace(/"/g, "") : "";

        objects.push({
          key,
          version: etag,
          size,
          etag,
          httpEtag: `"${etag}"`,
          uploaded,
          httpMetadata: {},
          customMetadata: {},
          writeHttpMetadata() {},
        } as unknown as R2Object);
      }
    }

    const isTruncatedMatch = /<IsTruncated>(.*?)<\/IsTruncated>/.exec(xml);
    const isTruncated = isTruncatedMatch
      ? isTruncatedMatch[1] === "true"
      : false;
    const nextTokenMatch =
      /<NextContinuationToken>(.*?)<\/NextContinuationToken>/.exec(xml);
    const cursor = nextTokenMatch ? nextTokenMatch[1] : undefined;

    const prefixes: string[] = [];
    const cpRegex =
      /<CommonPrefixes>[\s\S]*?<Prefix>(.*?)<\/Prefix>[\s\S]*?<\/CommonPrefixes>/g;
    let cpMatch: RegExpExecArray | null;
    while ((cpMatch = cpRegex.exec(xml)) !== null) {
      prefixes.push(cpMatch[1]);
    }

    return {
      objects,
      truncated: isTruncated,
      cursor,
      delimitedPrefixes: prefixes,
    } as unknown as R2Objects;
  }
}

// Memory cache untuk instance adapter agar tidak instantiate berulang di setiap request
let cachedAdapter: S3R2BucketAdapter | null = null;
let cachedKey: string = "";

/**
 * Helper terpadu untuk mendapatkan instance storage bucket R2:
 * 1. Menggunakan kredensial S3 Cross-Account jika R2_ACCOUNT_ID & R2_ACCESS_KEY_ID diset.
 * 2. Fallback mulus ke binding native Cloudflare (c.env.MEDIA_BUCKET || c.env.BUCKET) jika belum diset.
 */
export function getStorageBucket(contextOrEnv: any): R2Bucket | undefined {
  if (!contextOrEnv) return undefined;
  const env = contextOrEnv.env || contextOrEnv;

  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucketName = env.R2_BUCKET_NAME;

  if (accountId && accessKeyId && secretAccessKey && bucketName) {
    const cacheKey = `${accountId}:${bucketName}:${accessKeyId}`;
    if (!cachedAdapter || cachedKey !== cacheKey) {
      cachedAdapter = new S3R2BucketAdapter({
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName,
      });
      cachedKey = cacheKey;
    }
    return cachedAdapter as unknown as R2Bucket;
  }

  return env.MEDIA_BUCKET || env.BUCKET || env.MY_BUCKET || env.R2;
}
