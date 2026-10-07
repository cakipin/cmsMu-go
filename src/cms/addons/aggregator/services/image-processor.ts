import { getStorageBucket } from "../../../storage/r2-adapter";

/**
 * Helper: Mengunduh gambar artikel, mengonversinya ke WebP dengan sharp,
 * mengunggahnya ke Cloudflare R2, dan mencatatnya ke media_meta CMSMu.
 */
export async function processAndUploadImage(
  imageUrl: string,
  title: string,
  sourceName: string,
  sourceSlug: string,
  c: any
): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith("http")) return "";
  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) return imageUrl;

    const arrayBuffer = await res.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength < 100) return imageUrl;

    // Konversi gambar ke WebP menggunakan sharp jika runtime mendukung
    let webpBuffer: any = Buffer.from(arrayBuffer);
    try {
      const sharpModule = await new Function('return import("sharp")')();
      const sharpFn = sharpModule.default || sharpModule;
      webpBuffer = await sharpFn(Buffer.from(arrayBuffer))
        .webp({ quality: 80 })
        .toBuffer();
    } catch (sharpErr) {
      console.warn(
        "Sharp conversion not available in current runtime, using original buffer:",
        sharpErr
      );
    }

    const bucket = getStorageBucket(c);
    if (!bucket) {
      return imageUrl; // Fallback jika R2 belum siap
    }

    const cleanSource =
      (sourceSlug || "agregator").toLowerCase().replace(/[^a-z0-9_-]/g, "") ||
      "agregator";
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const folder = `${cleanSource}/${year}/${month}`;
    const cleanSlug = title
      ? title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .slice(0, 40)
      : "foto";
    const key = `${folder}/${Date.now()}-${cleanSlug}.webp`;

    await bucket.put(key, webpBuffer, {
      httpMetadata: { contentType: "image/webp" },
    });

    const fileUrl = `/api/media/file/${key}`;

    // Catat ke tabel media_meta CMSMu agar muncul di Media Library
    try {
      await c.env.DB.prepare(
        `
        INSERT INTO media_meta (key, url, type, size, title, alt, caption, created_at)
        VALUES (?, ?, 'image/webp', ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `
      )
        .bind(
          key,
          fileUrl,
          webpBuffer.length,
          title || "Foto Berita Agregator",
          title || "Foto Berita Agregator",
          sourceName ? `Foto: Dok. ${sourceName}` : ""
        )
        .run();
    } catch (metaErr) {}

    return fileUrl;
  } catch (err) {
    console.error("Failed to process and upload image to R2:", err);
    return imageUrl;
  }
}

/**
 * Helper: Memindai seluruh <img> di dalam isi artikel, mengunduhnya,
 * mengonversinya ke WebP, mengunggah ke R2 ({sourceSlug}/{year}/{month}/...),
 * dan menggantikan src asli dengan URL R2 internal.
 */
export async function processArticleInlineImages(
  htmlContent: string,
  title: string,
  sourceName: string,
  sourceSlug: string,
  c: any
): Promise<string> {
  if (!htmlContent) return "";

  const imgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  const matches = [...htmlContent.matchAll(imgRegex)];
  if (!matches.length) return htmlContent;

  let updatedContent = htmlContent;
  let idx = 1;

  for (const match of matches) {
    const origSrc = match[1];
    if (!origSrc || origSrc.startsWith("/api/media/")) continue;

    try {
      const inlineTitle = `${title}-inline-${idx}`;
      const r2Url = await processAndUploadImage(
        origSrc,
        inlineTitle,
        sourceName,
        sourceSlug,
        c
      );
      if (r2Url && r2Url !== origSrc) {
        updatedContent = updatedContent.split(origSrc).join(r2Url);
      }
      idx++;
    } catch (e) {
      console.warn("Gagal memproses inline image:", origSrc, e);
    }
  }

  return updatedContent;
}
