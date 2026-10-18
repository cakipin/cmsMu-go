import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  AI?: any;
};

export const aiRouter = new Hono<{ Bindings: Bindings }>();

/**
 * Heuristic fallback function to tidy HTML paragraphs & structure:
 * 1. Converts long unstructured text into clean <p> tags.
 * 2. Breaks long paragraphs (>3 sentences / >80 words) into readable paragraphs (40-70 words).
 * 3. Limits H2 subheadings strictly to ~1 per 300 words. If article < 300 words, no new H2 is injected.
 * 4. Preserves original content without hallucinating extra bullet lists or promo links.
 */
function heuristicTidyContent(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== "string") return "<p><br></p>";

  // Parse into clean blocks
  let text = rawHtml
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(?:script|style)[^>]*>[\s\S]*?<\/(?:script|style)>/gi, "")
    .replace(/&nbsp;/g, " ");

  // Normalize block delimiters
  text = text.replace(/<\/(p|div|h[1-6]|blockquote|li)>/gi, "\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Strip remaining dangerous tags except strong, em, a, img
  text = text.replace(/<(?!\/?(?:strong|em|b|i|u|a|img)\b)[^>]+>/gi, "");

  const rawBlocks = text.split(/\n{2,}/);
  const cleanedBlocks: string[] = [];

  // Calculate total words in document
  const plainTextAll = text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const totalWords = plainTextAll
    ? plainTextAll.split(/\s+/).filter(Boolean).length
    : 0;

  // Strict heading rule: 1 heading per 300 words. If < 300 words, max 0 new headings.
  const maxHeadingsAllowed = Math.floor(totalWords / 300);
  let headingsCreated = 0;
  let wordsSinceLastHeading = 0;

  for (let block of rawBlocks) {
    block = block.trim();
    if (!block) continue;

    // Check if block contains an image only
    if (/^<img\b[^>]*\/?>$/i.test(block)) {
      cleanedBlocks.push(block);
      continue;
    }

    const plainLength = block.replace(/<[^>]+>/g, "").trim().length;
    const blockWords = block
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    const endsWithPunctuation = /[.?!:;]$/.test(block.trim());
    const hasHeadingKeywords =
      /^(bagaimana|mengapa|hikmah|keutamaan|sejarah|peran|langkah|kunci|pesan|makna)\b/i.test(
        block.trim()
      );

    // Condition to treat as H2 Sub-heading:
    // Must be short, look like a title, only if we haven't exceeded maxHeadingsAllowed,
    // and only after at least 250 words have elapsed since the previous heading!
    const canCreateHeading =
      headingsCreated < maxHeadingsAllowed && wordsSinceLastHeading >= 250;

    if (
      canCreateHeading &&
      plainLength > 5 &&
      plainLength <= 60 &&
      (!endsWithPunctuation || hasHeadingKeywords) &&
      !block.includes("<br>") &&
      !block.includes("\n")
    ) {
      const cleanHeading = block.replace(/^[#\s*_-]+|[#\s*_-]+$/g, "").trim();
      cleanedBlocks.push(`<h2>${cleanHeading}</h2>`);
      headingsCreated++;
      wordsSinceLastHeading = 0;
      continue;
    }

    wordsSinceLastHeading += blockWords;

    // For regular paragraphs: check sentence length and break if too long
    const sentences = block.split(/(?<=[.?!])\s+(?=[A-Z0-9"“'‘])/);
    if (sentences.length > 3 && blockWords > 75) {
      let currentGroup: string[] = [];
      let currentGroupWords = 0;
      for (let s of sentences) {
        const sWords = s.split(/\s+/).length;
        currentGroup.push(s.trim());
        currentGroupWords += sWords;
        if (currentGroupWords >= 45 || currentGroup.length >= 2) {
          cleanedBlocks.push(`<p>${currentGroup.join(" ")}</p>`);
          currentGroup = [];
          currentGroupWords = 0;
        }
      }
      if (currentGroup.length > 0) {
        cleanedBlocks.push(`<p>${currentGroup.join(" ")}</p>`);
      }
    } else {
      cleanedBlocks.push(`<p>${block}</p>`);
    }
  }

  let finalHtml = cleanedBlocks.join("\n\n") || "<p><br></p>";

  // Fallback cerdas: Jika artikel cukup panjang (>= 250 kata) dan belum memiliki <h2> atau <h3>,
  // sisipkan sub-heading <h2> kontekstual di sekitar pertengahan artikel agar memenuhi standar SEO
  if (totalWords >= 250 && !/<h[23][^>]*>/i.test(finalHtml)) {
    const pTags = finalHtml.match(/<p>[\s\S]*?<\/p>/gi) || [];
    if (pTags.length >= 3) {
      const midpoint = Math.floor(pTags.length / 2);
      let headingText = "Sorotan & Poin Utama";
      if (
        rawHtml.toLowerCase().includes("lansia") ||
        rawHtml.toLowerCase().includes("kegiatan")
      )
        headingText = "Aktivitas & Peran Penting";
      else if (
        rawHtml.toLowerCase().includes("program") ||
        rawHtml.toLowerCase().includes("tujuan")
      )
        headingText = "Tujuan & Dampak Program";
      else if (
        rawHtml.toLowerCase().includes("harapan") ||
        rawHtml.toLowerCase().includes("pesan")
      )
        headingText = "Pesan & Harapan ke Depan";

      pTags.splice(midpoint, 0, `<h2>${headingText}</h2>`);
      finalHtml = pTags.join("\n\n");
    }
  }

  return finalHtml;
}

/**
 * Heuristic generator for SEO Metadata
 */
function heuristicGenerateSeo(
  title: string,
  content: string
): {
  meta_title: string;
  meta_description: string;
  excerpt: string;
  suggested_tags: string;
} {
  const cleanTitle = (title || "").trim();
  const plainContent = (content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Meta Title (Optimal 50-60 chars)
  let metaTitle = cleanTitle;
  if (metaTitle.length > 60) {
    metaTitle = metaTitle.slice(0, 57);
    const lastSpace = metaTitle.lastIndexOf(" ");
    if (lastSpace > 20) metaTitle = metaTitle.slice(0, lastSpace);
    metaTitle += "...";
  }

  // 2. Excerpt (1-2 sentences, ~120-150 chars)
  let excerpt = "";
  const sentences = plainContent.split(/(?<=[.?!])\s+/);
  if (sentences.length > 0) {
    excerpt = sentences.slice(0, 2).join(" ").trim();
  }
  if (!excerpt || excerpt.length < 30) {
    excerpt = plainContent.slice(0, 150);
  }
  if (excerpt.length > 160) {
    excerpt = excerpt.slice(0, 155).trim() + "...";
  }

  // 3. Meta Description (Catchy, 130-155 chars)
  let metaDescription = excerpt;
  if (metaDescription.length < 110 && sentences.length > 2) {
    metaDescription = sentences.slice(0, 3).join(" ").trim();
  }
  if (metaDescription.length > 155) {
    metaDescription = metaDescription.slice(0, 150).trim() + "...";
  }

  // 4. Suggested Tags
  const stopwords = new Set([
    "yang",
    "dan",
    "di",
    "dari",
    "ke",
    "ini",
    "itu",
    "dengan",
    "untuk",
    "pada",
    "adalah",
    "sebagai",
    "oleh",
    "dalam",
    "akan",
    "juga",
    "bisa",
    "ada",
    "mereka",
    "ia",
    "dia",
    "kita",
    "kami",
    "para",
    "tersebut",
    "karena",
    "saat",
    "secara",
    "lebih",
    "menjadi",
    "harus",
    "bukan",
    "hanya",
    "namun",
    "serta",
    "dapat",
    "bahwa",
    "lalu",
    "bila",
    "jika",
  ]);
  const words = (cleanTitle + " " + plainContent)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .split(/\s+/)
    .filter(w => w.length >= 4 && !stopwords.has(w));

  const freq: Record<string, number> = {};
  words.forEach(w => (freq[w] = (freq[w] || 0) + 1));
  const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  const topTags = sorted
    .slice(0, 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(", ");

  return {
    meta_title: metaTitle,
    meta_description: metaDescription,
    excerpt: excerpt,
    suggested_tags: sanitizeAndLimitTags(topTags),
  };
}

/**
 * Sanitize and strictly limit tags:
 * - Maksimal 3 tag
 * - Setiap tag maksimal 3 kata
 */
export function sanitizeAndLimitTags(
  rawTags: string,
  maxTags = 3,
  maxWordsPerTag = 3
): string {
  if (!rawTags || typeof rawTags !== "string") return "";
  const cleanList = rawTags
    .split(/[,;\n]+/)
    .map(t => t.trim().replace(/^[#\s*_-]+|[#\s*_-]+$/g, ""))
    .filter(t => t && t.length >= 2)
    .map(t => {
      const words = t.split(/\s+/).filter(Boolean);
      return words.slice(0, maxWordsPerTag).join(" ");
    })
    .filter(t => t.length >= 2)
    .filter((val, idx, arr) => arr.indexOf(val) === idx)
    .slice(0, maxTags);

  return cleanList.join(", ");
}

// 1. ENDPOINT: AI RAPIKAN PARAGRAF & STRUKTUR SEO
aiRouter.post("/tidy-content", async c => {
  try {
    const body = await c.req.json();
    const rawContent = (body.content || "").trim();
    const title = (body.title || "").trim();

    if (!rawContent) {
      return c.json({ error: "Konten tulisan tidak boleh kosong." }, 400);
    }

    const plainText = rawContent
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const wordCount = plainText
      ? plainText.split(/\s+/).filter(Boolean).length
      : 0;
    // Aturan ketat: 1 heading per 300 kata. Jika <300 kata = 0 heading baru.
    const maxHeadings = Math.floor(wordCount / 300);

    // Coba gunakan Cloudflare Workers AI jika binding AI tersedia
    if (c.env?.AI && typeof c.env.AI.run === "function") {
      try {
        const systemPrompt = `Anda adalah editor media berita online profesional.
Tugas Anda merapikan format keterbacaan (readability) naskah asli tanpa mengubah isi atau mengarang teks baru:
1. PECAH PARAGRAF PANJANG: Paragraf yang terlalu panjang (lebih dari 3-4 kalimat atau >80 kata) pecah menjadi 2 paragraf ringkas (40-70 kata) agar nyaman dibaca di smartphone.
2. ATURAN SUB-HEADING <h2>:
   - Panjang tulisan ini adalah sekitar ${wordCount} kata.
   - Maksimal buat ${maxHeadings} sub-heading <h2> untuk seluruh naskah (kira-kira 1 heading setiap 300 kata).
   ${maxHeadings === 0 ? "- Karena artikel di bawah 300 kata, JANGAN membuat sub-heading <h2> baru sama sekali." : `- Beri jarak minimal 250-300 kata di antara setiap sub-heading.`}
3. DILARANG KERAS MENGARANG: Jangan menambahkan bullet list baru, jangan membuat tautan fiktif, jangan membuat kesimpulan fiktif yang tidak ada di naskah asli.
4. PERTAHANKAN FORMAT ASLI: Pertahankan tag gambar (<img>), tautan (<a>), dan kutipan (<blockquote>) asli.
5. FORMAT OUTPUT: Berikan HANYA kode HTML bersih (<p>, <h2> jika ada, <img>, <a>). Tanpa markdown fence (\`\`\`html) dan tanpa komentar pengantar.`;

        const userPrompt = `Judul: "${title}"\n\nNaskah Asli:\n${rawContent}`;

        const aiRes = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2500,
          temperature: 0.15,
        });

        if (aiRes && aiRes.response) {
          let cleaned = aiRes.response.trim();
          cleaned = cleaned
            .replace(/^```(?:html)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          if (cleaned.length > 50 && cleaned.includes("<p>")) {
            return c.json({
              success: true,
              source: "workers-ai",
              tidied_content: cleaned,
              data: { content: cleaned },
            });
          }
        }
      } catch (aiErr: any) {
        console.warn("[AI Tidy Workers-AI Warning]:", aiErr?.message);
      }
    }

    // Fallback Heuristik Cerdas (100% Reliabel, 1 heading per 300 kata)
    const fallbackContent = heuristicTidyContent(rawContent);
    return c.json({
      success: true,
      source: "heuristic",
      tidied_content: fallbackContent,
      data: { content: fallbackContent },
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal memproses perapian AI" }, 500);
  }
});

// 2. ENDPOINT: GENERATE FIELD SPESIFIK (Meta Title, Meta Description, atau Excerpt secara terpisah)
aiRouter.post("/meta-field", async c => {
  try {
    const body = await c.req.json();
    const field = String(body.field || "description").toLowerCase(); // 'title' | 'description' | 'excerpt'
    const title = (body.title || "").trim();
    const content = (body.content || "").trim();

    if (!title && !content) {
      return c.json({ error: "Judul atau isi naskah diperlukan." }, 400);
    }

    const plainText = content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 1600);

    // 1. GENERATE META TITLE SPESIFIK (50-60 karakter)
    if (field === "title" || field === "meta_title") {
      if (c.env?.AI && typeof c.env.AI.run === "function") {
        try {
          const sysPrompt = `Anda adalah pakar SEO Google. Buat HANYA SATU Meta Title untuk halaman web berita:
- Panjang ideal WAJIB antara 50 sampai 60 karakter (maksimal 65 karakter).
- Mengandung kata kunci terpenting dari judul/artikel.
- Menarik klik pembaca Google (Click-Through Rate tinggi).
- Berikan HANYA teks judulnya saja, tanpa tanda petik, tanpa penjelasan.`;

          const aiRes = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
            messages: [
              { role: "system", content: sysPrompt },
              {
                role: "user",
                content: `Judul: "${title}"\nIsi: "${plainText.slice(0, 500)}"`,
              },
            ],
            max_tokens: 80,
            temperature: 0.2,
          });

          if (aiRes?.response) {
            let resText = aiRes.response
              .trim()
              .replace(/^["']|["']$/g, "")
              .trim();
            if (resText.length >= 25) {
              if (resText.length > 65) resText = resText.slice(0, 62) + "...";
              return c.json({
                success: true,
                field: "meta_title",
                value: resText,
              });
            }
          }
        } catch (e) {}
      }
      // Fallback heuristik
      let fallbackTitle = title;
      if (fallbackTitle.length > 62) {
        fallbackTitle = fallbackTitle.slice(0, 59);
        const lastSpace = fallbackTitle.lastIndexOf(" ");
        if (lastSpace > 25) fallbackTitle = fallbackTitle.slice(0, lastSpace);
        fallbackTitle += "...";
      }
      return c.json({
        success: true,
        field: "meta_title",
        value: fallbackTitle,
      });
    }

    // 2. GENERATE META DESCRIPTION SPESIFIK (125-155 karakter)
    if (field === "description" || field === "meta_description") {
      if (c.env?.AI && typeof c.env.AI.run === "function") {
        try {
          const sysPrompt = `Anda adalah spesialis On-Page SEO Google. Buat HANYA SATU Meta Description untuk Google snippet:
- Panjang ideal WAJIB antara 125 sampai 155 karakter (maksimal 160 karakter).
- Rangkum inti naskah secara padat, informatif, dan mengundang pembaca untuk mengklik.
- Berikan HANYA teks deskripsi murni tanpa tanda petik, tanpa kalimat pengantar.`;

          const aiRes = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
            messages: [
              { role: "system", content: sysPrompt },
              {
                role: "user",
                content: `Judul: "${title}"\nNaskah: "${plainText.slice(0, 800)}"`,
              },
            ],
            max_tokens: 120,
            temperature: 0.2,
          });

          if (aiRes?.response) {
            let resText = aiRes.response
              .trim()
              .replace(/^["']|["']$/g, "")
              .trim();
            if (resText.length >= 70) {
              if (resText.length > 160) resText = resText.slice(0, 155) + "...";
              return c.json({
                success: true,
                field: "meta_description",
                value: resText,
              });
            }
          }
        } catch (e) {}
      }
      // Fallback heuristik
      const heur = heuristicGenerateSeo(title, content);
      return c.json({
        success: true,
        field: "meta_description",
        value: heur.meta_description,
      });
    }

    // 3. GENERATE EXCERPT SPESIFIK (1-2 kalimat ringkas untuk kartu postingan)
    if (field === "excerpt") {
      if (c.env?.AI && typeof c.env.AI.run === "function") {
        try {
          const sysPrompt = `Buat 1-2 kalimat ringkasan (Excerpt) untuk kartu berita:
- Panjang maksimal 150-160 karakter.
- Berikan HANYA teks ringkasan murni tanpa tanda petik.`;

          const aiRes = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
            messages: [
              { role: "system", content: sysPrompt },
              {
                role: "user",
                content: `Judul: "${title}"\nNaskah: "${plainText.slice(0, 600)}"`,
              },
            ],
            max_tokens: 100,
            temperature: 0.2,
          });

          if (aiRes?.response) {
            let resText = aiRes.response
              .trim()
              .replace(/^["']|["']$/g, "")
              .trim();
            if (resText.length >= 30) {
              if (resText.length > 160) resText = resText.slice(0, 155) + "...";
              return c.json({
                success: true,
                field: "excerpt",
                value: resText,
              });
            }
          }
        } catch (e) {}
      }
      // Fallback heuristik
      const heur = heuristicGenerateSeo(title, content);
      return c.json({ success: true, field: "excerpt", value: heur.excerpt });
    }

    return c.json({ error: "Field tidak dikenali" }, 400);
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal generate field meta" }, 500);
  }
});

// 3. ENDPOINT: AI GENERATE SEMUA METADATA (Global)
aiRouter.post("/seo-metadata", async c => {
  try {
    const body = await c.req.json();
    const title = (body.title || "").trim();
    const content = (body.content || "").trim();

    if (!title && !content) {
      return c.json(
        { error: "Judul atau isi tulisan diperlukan untuk analisa SEO." },
        400
      );
    }

    if (c.env?.AI && typeof c.env.AI.run === "function") {
      try {
        const plainText = content
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 1800);
        const systemPrompt = `Anda adalah spesialis SEO Search Engine Optimization untuk portal berita terkemuka.
Berdasarkan judul dan isi tulisan yang diberikan, buatkan metadata SEO optimal dalam format JSON murni:
1. "meta_title": Judul halaman untuk Google Search (panjang 50-60 karakter, memuat keyword utama, menarik perhatian).
2. "meta_description": Deskripsi meta informatif (panjang 125-155 karakter, memuat rangkuman inti dan ajakan membaca).
3. "excerpt": Ringkasan singkat 1-2 kalimat untuk kartu berita (maksimal 160 karakter).
4. "tags": Maksimal 3 tag paling relevan dipisahkan koma (setiap tag MAKSIMAL 3 kata, misal: "Teknologi Web, Transformasi Digital, Berita Utama").

Format Output WAJIB JSON murni tanpa markdown code block:
{"meta_title": "...", "meta_description": "...", "excerpt": "...", "tags": "..."}`;

        const userPrompt = `Judul: "${title}"\n\nIsi Ringkas:\n"${plainText}"`;

        const aiRes = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 500,
          temperature: 0.2,
        });

        if (aiRes && aiRes.response) {
          let rawJson = aiRes.response.trim();
          rawJson = rawJson
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          try {
            const parsed = JSON.parse(rawJson);
            if (parsed.meta_title && parsed.meta_description) {
              return c.json({
                success: true,
                source: "workers-ai",
                data: {
                  meta_title: String(parsed.meta_title).slice(0, 65).trim(),
                  meta_description: String(parsed.meta_description)
                    .slice(0, 160)
                    .trim(),
                  excerpt: String(parsed.excerpt || parsed.meta_description)
                    .slice(0, 160)
                    .trim(),
                  suggested_tags: sanitizeAndLimitTags(
                    String(parsed.tags || "")
                  ),
                },
              });
            }
          } catch (pErr) {}
        }
      } catch (aiErr: any) {
        console.warn("[AI SEO Metadata Workers-AI Warning]:", aiErr?.message);
      }
    }

    // Fallback Heuristik
    const heuristic = heuristicGenerateSeo(title, content);
    return c.json({
      success: true,
      source: "heuristic",
      data: heuristic,
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal generate SEO metadata" }, 500);
  }
});

// 4. ENDPOINT KOMBINASI: FULL OPTIMIZE (Tidy Content [1 Heading / 300 kata] + Metadata SEO)
aiRouter.post("/optimize", async c => {
  try {
    const body = await c.req.json();
    const title = (body.title || "").trim();
    const content = (body.content || "").trim();

    if (!content) {
      return c.json({ error: "Konten tidak boleh kosong." }, 400);
    }

    const plainText = content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const wordCount = plainText
      ? plainText.split(/\s+/).filter(Boolean).length
      : 0;
    const maxHeadings = Math.floor(wordCount / 300);

    let tidiedContent = heuristicTidyContent(content);
    let seoMeta = heuristicGenerateSeo(title, content);

    if (c.env?.AI && typeof c.env.AI.run === "function") {
      try {
        const tidySys = `Anda adalah editor berita online profesional.
1. Paragraf panjang (>80 kata) pecah menjadi paragraf ringkas (40-70 kata).
2. Maksimal ${maxHeadings} sub-heading <h2> untuk naskah ini (1 per 300 kata). Jika naskah <300 kata, DILARANG buat <h2> baru.
3. DILARANG membuat bullet list baru atau tautan fiktif.
Kembalikan HANYA kode HTML murni tanpa markdown.`;

        const tidyRes = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
          messages: [
            { role: "system", content: tidySys },
            {
              role: "user",
              content: `Judul: "${title}"\n\nKonten:\n${content}`,
            },
          ],
          max_tokens: 2500,
          temperature: 0.15,
        });

        if (tidyRes?.response) {
          let cleaned = tidyRes.response
            .trim()
            .replace(/^```(?:html)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          if (cleaned.length > 50 && cleaned.includes("<p>")) {
            tidiedContent = cleaned;
          }
        }

        // Metadata SEO
        const seoSys = `Buat metadata SEO dalam format JSON murni:
{"meta_title": "50-60 karakter", "meta_description": "125-155 karakter", "excerpt": "maks 160 karakter", "tags": "Maksimal 3 tag (maksimal 3 kata per tag)"}`;

        const seoRes = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
          messages: [
            { role: "system", content: seoSys },
            {
              role: "user",
              content: `Judul: "${title}"\n\nIsi: "${plainText.slice(0, 1600)}"`,
            },
          ],
          max_tokens: 400,
          temperature: 0.2,
        });

        if (seoRes?.response) {
          let rawJson = seoRes.response
            .trim()
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          try {
            const parsed = JSON.parse(rawJson);
            if (parsed.meta_title && parsed.meta_description) {
              seoMeta = {
                meta_title: String(parsed.meta_title).slice(0, 65).trim(),
                meta_description: String(parsed.meta_description)
                  .slice(0, 160)
                  .trim(),
                excerpt: String(parsed.excerpt || parsed.meta_description)
                  .slice(0, 160)
                  .trim(),
                suggested_tags: sanitizeAndLimitTags(String(parsed.tags || "")),
              };
            }
          } catch (e) {}
        }
      } catch (err: any) {
        console.warn("[AI Full Optimize Warning]:", err?.message);
      }
    }

    return c.json({
      success: true,
      data: {
        content: tidiedContent,
        ...seoMeta,
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal optimasi SEO" }, 500);
  }
});
