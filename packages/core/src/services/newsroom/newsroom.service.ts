export interface PublishQueueItemPayload {
  title: string;
  excerpt?: string;
  contentHtml: string;
  category?: string;
  author?: string;
  featured_image?: string;
  tags?: string;
  published_at?: string;
}

export async function approveAndPublishQueueItem(d1: any, id: string, payload: PublishQueueItemPayload): Promise<{ success: boolean; message: string; slug?: string; error?: string }> {
  const { title, excerpt, contentHtml, category, author, featured_image, tags } = payload;
  if (!title || !contentHtml) {
    return { success: false, message: 'Judul dan konten wajib diisi', error: 'Judul dan konten wajib diisi' };
  }

  // 1. Ambil info antrean dan sumber asli
  const queueItem: any = await d1.prepare("SELECT * FROM curation_queue WHERE id = ?").bind(id).first();
  const sourceName = queueItem ? (await d1.prepare("SELECT name FROM media_sources WHERE id = ?").bind(queueItem.source_id).first())?.name : '';

  // 2. Buat slug unik
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  // 3. Format final body dengan atribusi kanonikal jika belum ada
  let finalBody = contentHtml;
  if (queueItem && queueItem.raw_url && !finalBody.includes('attribution-box')) {
    finalBody += `
<blockquote class="attribution-box border-l-4 border-emerald-600 pl-4 py-2 my-4 bg-emerald-50 text-slate-700 text-sm">
  <strong>Sumber Berita:</strong> Disadur dari <a href="${queueItem.raw_url}" target="_blank" rel="noopener canonical" class="text-emerald-700 font-semibold underline">${sourceName || 'Media Terkait'}</a> untuk kepentingan syiar dakwah persyarikatan.
</blockquote>`;
  }

  const postCategory = category || queueItem?.default_category || 'Berita Daerah';
  const postImage = featured_image || queueItem?.raw_image || '';
  const postExcerpt = excerpt || queueItem?.raw_description || title;
  const postAuthor = author || sourceName || 'Redaksi Newsroom';
  const postTags = tags || `Muhammadiyah, ${postCategory}`;

  // 4. Preservasi WAKTU RILIS ASLI sebagai created_at
  const rawPublishedAt = payload.published_at || queueItem?.raw_published_at;
  let publishCreatedAt = new Date().toISOString();
  if (rawPublishedAt) {
    try {
      const parsedDate = new Date(rawPublishedAt);
      if (!isNaN(parsedDate.getTime())) {
        publishCreatedAt = parsedDate.toISOString();
      }
    } catch (e) {}
  }

  // 5. Insert ke tabel posts resmi
  await d1.prepare(`
    INSERT INTO posts (
      title, slug, body, status, category, author, 
      featured_image, excerpt, meta_title, meta_description, tags,
      created_at, updated_at
    )
    VALUES (?, ?, ?, 'publish', ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    title,
    slug,
    finalBody,
    postCategory,
    postAuthor,
    postImage,
    postExcerpt ? postExcerpt.slice(0, 200) : '',
    title,
    postExcerpt ? postExcerpt.slice(0, 160) : '',
    postTags,
    publishCreatedAt
  ).run();

  // 6. Update status antrean
  await d1.prepare("UPDATE curation_queue SET status = 'published' WHERE id = ?").bind(id).run();

  return {
    success: true,
    message: 'Berita berhasil disetujui dan langsung diterbitkan ke portal utama!',
    slug
  };
}

export async function rejectQueueItem(d1: any, id: string): Promise<{ success: boolean; message: string }> {
  await d1.prepare("UPDATE curation_queue SET status = 'rejected' WHERE id = ?").bind(id).run();
  return { success: true, message: 'Berita berhasil diabaikan dari antrean' };
}
