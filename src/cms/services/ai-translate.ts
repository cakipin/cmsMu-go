export async function translateTextWithAI(
  text: string,
  targetLang: "en" | "ar",
  cacheKey: string,
  env: { AI?: any; sa_cache?: any },
  isHtml: boolean = false
): Promise<string> {
  // Fitur AI Translate dinonaktifkan sementara sesuai instruksi user
  const AI_TRANSLATE_ENABLED = false;
  if (!AI_TRANSLATE_ENABLED || !text || !text.trim()) return text;

  // Versioning cache key to bust old bad cache
  const versionedKey = cacheKey + (isHtml ? ":v5:html" : ":v5:plain");

  if (env.sa_cache) {
    try {
      const cached = await env.sa_cache.get(versionedKey);
      if (cached) return cached;
    } catch (e) {
      console.error("[KV Cache Get Error]:", e);
    }
  }

  if (!env.AI) return text;
  const langName = targetLang === "en" ? "English" : "Arabic";
  let translated = "";

  if (!isHtml) {
    // PLAIN TEXT MODE (Titles, Excerpts, Categories)
    // Strip any HTML just in case
    const cleanText = text
      .replace(/<[^>]+>/g, "")
      .trim()
      .slice(0, 1000);
    try {
      const response: any = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-fp8",
        {
          messages: [
            {
              role: "system",
              content: `You are an expert ${langName} translator. You MUST output ONLY plain text. NEVER add HTML tags, asterisks, or markdown formatting.`,
            },
            {
              role: "user",
              content: `Translate from Indonesian to ${langName}. Return ONLY the translation.\n\nText: ${cleanText}`,
            },
          ],
          max_tokens: 512,
          temperature: 0.1,
        }
      );
      translated =
        typeof response === "string" ? response : response?.response || "";
      // Enforce clean output
      translated = translated
        .replace(/<[^>]+>/g, "")
        .replace(/[\*\_#`]/g, "")
        .trim();
    } catch (err: any) {
      console.error("[Workers AI Plain Error]:", err?.message);
    }
  } else {
    // HTML MODE (Long Article Bodies)
    // Split by closing paragraph or block tags to keep chunks structurally safe
    const parts = text.split(/(<\/p>|<\/div>|<br\s*\/?>|<\/h[1-6]>)/i);
    const chunks: string[] = [];
    let currentChunk = "";
    for (const part of parts) {
      // Chunk up to 1500 chars to avoid timeout and token limits in parallel
      if (currentChunk.length + part.length > 1500 && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      currentChunk += part;
    }
    if (currentChunk) chunks.push(currentChunk);

    try {
      // Process chunks in parallel to respect 10s-30s Worker limit while handling huge articles
      const promises = chunks.map(async chunk => {
        if (!chunk.trim()) return chunk;
        const response: any = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct-fp8",
          {
            messages: [
              {
                role: "system",
                content: `You are an expert ${langName} translator. You MUST preserve all HTML tags EXACTLY as they are. Do not alter HTML structures.`,
              },
              {
                role: "user",
                content: `Translate from Indonesian to ${langName}. Preserve all HTML tags. Return ONLY the translated HTML.\n\nText:\n${chunk}`,
              },
            ],
            max_tokens: 1500,
            temperature: 0.1,
          }
        );
        let tr =
          typeof response === "string" ? response : response?.response || chunk;
        return tr
          .trim()
          .replace(/^```[a-z]*\n?/, "")
          .replace(/\n?```$/, "")
          .trim();
      });

      const results = await Promise.all(promises);
      translated = results.join(" ");
    } catch (err: any) {
      console.error("[Workers AI HTML Error]:", err?.message);
    }
  }

  const finalOutput = translated || text;

  // Save to KV Cache (30 days TTL)
  if (env.sa_cache && translated) {
    try {
      await env.sa_cache.put(versionedKey, finalOutput, {
        expirationTtl: 30 * 86400,
      });
    } catch (e) {
      console.error("[KV Cache Put Error]:", e);
    }
  }

  return finalOutput;
}
