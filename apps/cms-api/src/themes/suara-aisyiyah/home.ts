import type { ThemeContext } from "../types";
import { escapeHtml, date, category, image } from "./utils";
export function renderHome(this: any, ctx: ThemeContext) {
  const isStructured = ctx.data && !Array.isArray(ctx.data) && ctx.data.latest;
  const posts = isStructured
    ? ctx.data.latest
    : Array.isArray(ctx.data)
      ? ctx.data
      : [];

  if (!posts.length)
    return this._layout(
      '<div class="container empty"><h1>Belum ada artikel</h1><p>Terbitkan artikel pertama untuk mengisi halaman ini.</p></div>',
      "Beranda",
      ctx,
      "home"
    );

  const [hero, ...rest] = posts;
  const side = rest.slice(0, 3);

  // Gunakan data dari backend (structured) jika tersedia, jika tidak maka filter secara lokal (fallback)
  const getCat = (key, name, max) => {
    if (isStructured && ctx.data[key]) return ctx.data[key].slice(0, max);
    return rest
      .filter(
        p => p.category && p.category.toLowerCase().includes(name.toLowerCase())
      )
      .slice(0, max);
  };

  const popular = isStructured ? ctx.data.popular : rest.slice(3, 7);
  const hikmah = getCat("hikmah", "Hikmah", 4);
  const keluargaSakinah = getCat("keluargaSakinah", "Keluarga Sakinah", 3);
  const kalam = getCat("kalam", "Kalam", 3);
  const wawasan = getCat("wawasan", "Wawasan", 4);
  const gayaHidup = getCat("gayaHidup", "Gaya Hidup", 3);
  const perempuan = getCat("perempuan", "Perempuan", 3);
  const hajiCat = ctx.site.sa_haji_category || "Haji";
  const liputanHaji = getCat("liputanHaji", hajiCat, 4);
  const inspirasi = getCat("inspirasi", "Inspirasi", 3);
  const muda = getCat("muda", "Muda", 3);
  const sosioTekno = getCat("sosioTekno", "Sains dan Tekno", 3);
  const isStructuredData = ctx.data && !Array.isArray(ctx.data);
  const videos =
    isStructuredData &&
    (ctx.data as any).videos &&
    (ctx.data as any).videos.length
      ? (ctx.data as any).videos.slice(0, 3)
      : rest
          .filter(
            (p: any) =>
              p.type === "video" ||
              (p.category && p.category.toLowerCase().includes("video")) ||
              (p.video_url && String(p.video_url).trim())
          )
          .slice(0, 3);

  const currentLang = (ctx as any).lang || "id";
  const langPrefix =
    currentLang && currentLang !== "id" ? `/${currentLang}` : "";

  const translateLabel = (text: string) => {
    if (currentLang === "en") {
      const map: Record<string, string> = {
        "Tulisan Populer": "Popular Posts",
        "Baca semua": "Read all",
        "Tonton semua": "Watch all",
        Inspirasi: "Inspiration",
        Hikmah: "Wisdom",
        Wawasan: "Insights",
        "Gaya Hidup": "Lifestyle",
        Perempuan: "Women",
        Muda: "Youth",
        "Sains dan Tekno": "Science & Tech",
        "Keluarga Sakinah": "Sakinah Family",
        Kalam: "Kalam",
        Video: "Video",
        "Belum ada tulisan di rubrik ini.": "No posts in this category yet.",
        "Belum ada video di rubrik ini.": "No videos in this category yet.",
      };
      return map[text] || text;
    }
    if (currentLang === "ar") {
      const map: Record<string, string> = {
        "Tulisan Populer": "المنشورات الشائعة",
        "Baca semua": "قراءة الكل",
        "Tonton semua": "مشاهدة الكل",
        Inspirasi: "إلهام",
        Hikmah: "حكمة",
        Wawasan: "رؤى",
        "Gaya Hidup": "أسلوب حياة",
        Perempuan: "نساء",
        Muda: "شباب",
        "Sains dan Tekno": "العلوم والتكنولوجيا",
        "Keluarga Sakinah": "الأسرة السكينة",
        Kalam: "كلام",
        Video: "فيديو",
        "Belum ada tulisan di rubrik ini.": "لا توجد مقالات في هذا القسم بعد.",
        "Belum ada video di rubrik ini.":
          "لا توجد مقاطع فيديو في هذا القسم بعد.",
      };
      return map[text] || text;
    }
    return text;
  };

  const cleanExcerpt = "";

  const lead = `
      <main class="container" role="main">
        <h1 class="sr-only">Suara 'Aisyiyah — Inspirasi Perempuan Berkemajuan</h1>
        <div class="hero-grid">
          <div class="hero-main post-card">
            <a href="${langPrefix}/${escapeHtml(hero.slug)}" class="post-img-wrap">
              <img src="${image(hero)}" alt="${escapeHtml(hero.title)}" loading="eager" width="800" height="450" fetchpriority="high">
            </a>
            <div class="hero-main-content">
              <a href="${langPrefix}/${category(hero).toLowerCase().replace(/\s+/g, "-")}" class="cat-tag">${category(hero)}</a>
              <h2><a href="${langPrefix}/${escapeHtml(hero.slug)}">${escapeHtml(hero.title)}</a></h2>
              <div class="post-meta">
                <span>${date(hero.created_at)}</span>
              </div>
              ${cleanExcerpt ? `<p>${cleanExcerpt}…</p>` : ""}
            </div>
          </div>
          <div class="hero-side">
            ${side
              .map(
                (p: any, i: number) => `
              <div class="side-post">
                <a href="${langPrefix}/${escapeHtml(p.slug)}" class="post-img-wrap">
                  <img src="${image(p, i + 1)}" alt="">
                </a>
                <div class="side-post-content">
                  <a href="${langPrefix}/${category(p).toLowerCase().replace(/\s+/g, "-")}" class="cat-tag">${category(p)}</a>
                  <h3><a href="${langPrefix}/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></h3>
                  <div class="post-meta">
                    <span>${date(p.created_at)}</span>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </main>
    `;

  const sectionPrayerWidget = `
      <div class="container sa-style-39" >
        <div class="prayer-widget-inner sa-style-40" >
          <div class="sa-style-41">
            <div class="prayer-location sa-style-42" >
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Yogyakarta
            </div>
            <div class="sa-style-43">
              Sumber: <a href="https://khgt.muhammadiyah.or.id" target="_blank" class="sa-style-44">khgt.muhammadiyah.or.id</a>
            </div>
          </div>
          
          <div id="prayer-times-container" class="sa-style-45">
             <span class="sa-style-46">Memuat jadwal KHGT...</span>
          </div>
          
          <div class="sa-style-47">
             <div id="prayer-masehi-date" class="sa-style-48"></div>
             <div id="prayer-hijri-date" class="sa-style-49"></div>
          </div>
        </div>
      </div>
    `;

  const sectionPopular = popular.length
    ? `
      <div class="container">
        <div class="section-block">
          <div class="section-header sa-style-50" >
            <h3 class="sa-style-51">${translateLabel("Tulisan Populer")}</h3>
            <a href="${langPrefix}/populer" class="sa-style-52">${translateLabel("Baca semua")} &rarr;</a>
          </div>
          <div class="card-grid">
            ${popular
              .map(
                (p: any, i: number) => `
              <div class="grid-post">
                <a href="${langPrefix}/${escapeHtml(p.slug)}" class="post-img-wrap">
                  <img src="${image(p, i + 4)}" alt="">
                </a>
                <div class="grid-post-content">
                  <a href="${langPrefix}/${category(p).toLowerCase().replace(/\s+/g, "-")}" class="cat-tag">${category(p)}</a>
                  <h4><a href="${langPrefix}/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></h4>
                  <div class="post-meta"><span>${date(p.created_at)}</span></div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `
    : "";

  let banner1Abad = "";
  if (ctx.site.sa_home_banner_html) {
    banner1Abad = `<div class="container sa-style-53" >${ctx.site.sa_home_banner_html}</div>`;
  } else if (ctx.site.sa_home_banner_image) {
    const linkHref = ctx.site.sa_home_banner_link
      ? `href="${ctx.site.sa_home_banner_link}" target="_blank"`
      : "";
    const tag = ctx.site.sa_home_banner_link ? "a" : "div";
    banner1Abad = `
          <div class="container sa-style-54" >
            <${tag} ${linkHref} class="sa-banner-tag">
               <img src="${ctx.site.sa_home_banner_image}" alt="Banner Utama" class="sa-style-55">
            </${tag}>
          </div>
        `;
  } else {
    banner1Abad = `
          <div class="container sa-style-54" >
            <div class="sa-style-56">
               <span class="sa-style-57">[ Placeholder Banner 1 Abad Suara 'Aisyiyah ]</span>
            </div>
          </div>
        `;
  }

  const createHorizontal = (title: string, items: any[]) => `
      <div class="container sa-style-58" >
        <div class="section-block">
          <div class="section-header sa-style-50" >
            <h3 class="sa-style-51">${translateLabel(title)}</h3>
            <a href="${langPrefix}/${title.toLowerCase().replace(/\s+/g, "-")}" class="sa-style-52">${translateLabel("Baca semua")} &rarr;</a>
          </div>
          ${
            items.length
              ? `
          <div class="card-grid">
            ${items
              .map(
                (p, i) => `
              <div class="grid-post">
                <a href="${langPrefix}/${escapeHtml(p.slug)}" class="post-img-wrap">
                  <img src="${image(p, i + 10)}" alt="">
                </a>
                <div class="grid-post-content">
                  <a href="${langPrefix}/${category(p).toLowerCase().replace(/\s+/g, "-")}" class="cat-tag">${category(p)}</a>
                  <h4><a href="${langPrefix}/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></h4>
                  <div class="post-meta"><span>${date(p.created_at)}</span></div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          `
              : `
          <div class="sa-style-59">
            ${translateLabel("Belum ada tulisan di rubrik ini.")}
          </div>
          `
          }
        </div>
      </div>
    `;

  const createLiputanHajiBlock = (title, items, link, catName) => `
      <div class="container sa-style-60" >
        <div class="sa-style-61">
          <h2 class="sa-style-62">
            <a href="${link}" class="sa-style-33">${title}</a>
          </h2>
        </div>
        ${
          items.length
            ? `
        <div class="sa-style-63">
          ${items
            .map(
              (p, i) => `
            <div>
              <a href="/${escapeHtml(p.slug)}" class="sa-style-64">
                <img src="${image(p, i)}" alt="${escapeHtml(p.title)}" loading="lazy" class="sa-style-65" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              </a>
              <div class="sa-style-66">
                <span class="sa-style-67"><span class="sa-style-68">●</span> ${escapeHtml((category(p) || catName).toUpperCase())}</span>
              </div>
              <h4 class="sa-style-70">
                <a href="/${escapeHtml(p.slug)}" class="sa-style-71" onmouseover="this.style.color='#059669'" onmouseout="this.style.color=''">${escapeHtml(p.title)}</a>
              </h4>
              <div class="sa-style-72">${date(p.created_at)}</div>
            </div>
          `
            )
            .join("")}
        </div>
        `
            : `
        <div class="sa-style-59">
          Belum ada tulisan di rubrik ini.
        </div>
        `
        }
      </div>
    `;

  const createVertical = (title: string, items: any[]) => `
      <div class="section-block sa-style-73" >
        <div class="section-header sa-style-50" >
          <h3 class="sa-style-51">${translateLabel(title)}</h3>
          <a href="${langPrefix}/${title.toLowerCase().replace(/\s+/g, "-")}" class="sa-style-52">${translateLabel("Baca semua")} &rarr;</a>
        </div>
        ${
          items.length
            ? `
        <div class="sa-style-74">
          ${items
            .map(
              (p, i) => `
            <div class="sa-style-75">
              <a href="${langPrefix}/${escapeHtml(p.slug)}" class="sa-style-76">
                <img src="${image(p, i + 20)}" class="sa-style-77" alt="">
              </a>
              <div class="sa-style-78">
                <h4 class="sa-style-79"><a href="${langPrefix}/${escapeHtml(p.slug)}" class="sa-style-80">${escapeHtml(p.title)}</a></h4>
                <span class="sa-style-81">${date(p.created_at)}</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        `
            : `
        <div class="sa-style-82">
          ${translateLabel("Belum ada tulisan di rubrik ini.")}
        </div>
        `
        }
      </div>
    `;

  const createVideoBlock = (items: any[]) => `
      <div class="section-block sa-style-73" >
        <div class="section-header sa-style-50" >
          <h3 class="sa-style-51">${translateLabel("Video")}</h3>
          <a href="${langPrefix}/videos" class="sa-style-52">${translateLabel("Tonton semua")} &rarr;</a>
        </div>
        ${
          items && items.length
            ? `
        <div class="sa-style-74">
          ${items
            .map((p: any, i: number) => {
              const vidUrl = p.video_url || p.videoUrl || "";
              const thumb = image(p, i + 25);
              return `
            <div class="sa-style-75 video-item-card">
              <a href="${langPrefix}/${escapeHtml(p.slug)}" onclick="openVideoModal('${escapeHtml(vidUrl)}', '${escapeHtml(p.title)}', '${langPrefix}/${escapeHtml(p.slug)}'); return false;" class="sa-style-76" style="position: relative; display: block; overflow: hidden; border-radius: 6px;" title="Putar Video: ${escapeHtml(p.title)}">
                <img src="${thumb}" class="sa-style-77" alt="${escapeHtml(p.title)}" loading="lazy">
                <div class="video-play-overlay" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); transition: all 0.25s;">
                  <span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #dc2626; color: #ffffff; border-radius: 50%; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                    <i class="fas fa-play" style="margin-left: 2px;"></i>
                  </span>
                </div>
              </a>
              <div class="sa-style-78">
                <h4 class="sa-style-79">
                  <a href="${langPrefix}/${escapeHtml(p.slug)}" onclick="openVideoModal('${escapeHtml(vidUrl)}', '${escapeHtml(p.title)}', '${langPrefix}/${escapeHtml(p.slug)}'); return false;" class="sa-style-80">${escapeHtml(p.title)}</a>
                </h4>
                <span class="sa-style-81">${date(p.created_at)}</span>
              </div>
            </div>
            `;
            })
            .join("")}
        </div>
        `
            : `
        <div class="sa-style-82">
          ${translateLabel("Belum ada video di rubrik ini.")}
        </div>
        `
        }
      </div>
    `;

  const createAdBox = (title, imageKey, linkKey, htmlKey, titleKey) => {
    const htmlCode = ctx.site[htmlKey];
    const image = ctx.site[imageKey];
    const link = ctx.site[linkKey];
    const customTitle = ctx.site[titleKey];

    const headerHtml = customTitle
      ? `
        <div class="sa-style-83">
          <span class="sa-style-84">${customTitle}</span>
        </div>
      `
      : "";

    if (htmlCode) {
      return `
          <div class="section-block sa-style-73" >
            ${headerHtml}
            <div class="sa-style-85">
              ${htmlCode}
            </div>
          </div>
        `;
    }
    if (image) {
      const linkHref = link ? `href="${link}" target="_blank"` : "";
      const tag = link ? "a" : "div";
      return `
          <div class="section-block sa-style-73" >
            ${headerHtml}
            <${tag} ${linkHref} class="sa-ad-tag">
              <img src="${image}" alt="${title}" class="sa-style-86">
            </${tag}>
          </div>
        `;
    }
    return `
      <div class="section-block sa-style-73" >
        <div class="section-header">
          <h3>${title}</h3>
        </div>
        <div class="sa-style-87">
          <span class="sa-style-88">Ruang Iklan &mdash; Silahkan Hubungi Redaksi Suara 'Aisyiyah</span>
        </div>
      </div>
      `;
  };

  const isHajiEnabled =
    ctx.site.sa_haji_enable !== "false" && ctx.site.sa_haji_enable !== false;
  const hajiTitle = ctx.site.sa_haji_title || "Liputan " + hajiCat;
  const hajiLink =
    "/" + encodeURIComponent(hajiCat.toLowerCase().replace(/\s+/g, "-"));

  const sectionGridBlocks = `
      ${isHajiEnabled ? createLiputanHajiBlock(hajiTitle, liputanHaji, hajiLink, hajiCat) : ""}
      ${createHorizontal("Hikmah", hikmah)}
      
      <div class="container sa-style-89" >
        <div class="sa-style-90">
          ${createAdBox("Iklan", "sa_home_ad_image", "sa_home_ad_link", "sa_home_ad_html", "sa_home_ad_title")}
          ${createVertical("Keluarga Sakinah", keluargaSakinah)}
          ${createVertical("Kalam", kalam)}
        </div>
      </div>

      ${createHorizontal("Wawasan", wawasan)}
      
      <div class="container sa-style-89" >
        <div class="sa-style-90">
          ${createVertical("Gaya Hidup", gayaHidup)}
          ${createVertical("Perempuan", perempuan)}
          ${createVideoBlock(videos)}
        </div>
      </div>
      
      <div class="container sa-style-89" >
        <div class="sa-style-90">
          ${createVertical("Inspirasi", inspirasi)}
          ${createVertical("Muda", muda)}
          ${createVertical("Sains dan Tekno", sosioTekno)}
        </div>
      </div>
    `;

  const videoModalHtml = `
      <div id="video-player-modal" class="in-system-modal" style="display: none; position: fixed; inset: 0; z-index: 99999; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); align-items: center; justify-content: center; padding: 16px;">
        <div style="position: relative; width: 100%; max-width: 820px; background: #0f172a; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); border: 1px solid #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; background: #1e293b; border-bottom: 1px solid #334155;">
            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #dc2626; color: #ffffff; border-radius: 4px; font-size: 10px; flex-shrink: 0;"><i class="fas fa-play"></i></span>
              <h4 id="video-modal-title" style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></h4>
            </div>
            <button type="button" onclick="closeVideoModal()" style="background: none; border: none; color: #94a3b8; font-size: 26px; line-height: 1; cursor: pointer; padding: 0 6px; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'" title="Tutup">&times;</button>
          </div>
          <div style="position: relative; width: 100%; padding-top: 56.25%; background: #000000;">
            <iframe id="video-modal-iframe" src="" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <video id="video-modal-player" src="" controls style="display:none; position: absolute; top:0; left:0; width:100%; height:100%;"></video>
          </div>
          <div style="padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; background: #1e293b; border-top: 1px solid #334155;">
            <span style="font-size: 12px; color: #94a3b8;">Suara 'Aisyiyah Video Channel</span>
            <a id="video-modal-link" href="#" style="color: #34d399; font-size: 13px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">Buka Halaman Artikel &rarr;</a>
          </div>
        </div>
      </div>
      <script>
        function openVideoModal(url, title, articleUrl) {
          var modal = document.getElementById('video-player-modal');
          var iframe = document.getElementById('video-modal-iframe');
          var videoPlayer = document.getElementById('video-modal-player');
          var titleEl = document.getElementById('video-modal-title');
          var linkEl = document.getElementById('video-modal-link');
          if (!modal) return;

          titleEl.textContent = title || 'Video Suara Aisyiyah';
          linkEl.href = articleUrl || '#';
          
          var embedUrl = '';
          if (url && (url.indexOf('youtu.be/') !== -1 || url.indexOf('youtube.com') !== -1)) {
            var vidId = '';
            if (url.indexOf('youtu.be/') !== -1) {
              vidId = url.split('youtu.be/')[1].split('?')[0].split('/')[0];
            } else if (url.indexOf('shorts/') !== -1) {
              vidId = url.split('shorts/')[1].split('?')[0].split('/')[0];
            } else if (url.indexOf('embed/') !== -1) {
              vidId = url.split('embed/')[1].split('?')[0].split('/')[0];
            } else {
              var m = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
              if (m && m[1]) vidId = m[1];
            }
            if (vidId) embedUrl = 'https://www.youtube-nocookie.com/embed/' + vidId + '?autoplay=1&rel=0';
          } else if (url && url.indexOf('vimeo.com/') !== -1) {
            var vId = url.split('vimeo.com/')[1].split('?')[0].split('/')[0];
            if (vId) embedUrl = 'https://player.vimeo.com/video/' + vId + '?autoplay=1';
          }

          if (embedUrl) {
            if (videoPlayer) { videoPlayer.style.display = 'none'; videoPlayer.pause(); }
            if (iframe) { iframe.style.display = 'block'; iframe.src = embedUrl; }
          } else if (url && /\\.(mp4|webm)($|\\?)/i.test(url)) {
            if (iframe) { iframe.style.display = 'none'; iframe.src = ''; }
            if (videoPlayer) { videoPlayer.style.display = 'block'; videoPlayer.src = url; videoPlayer.play(); }
          } else if (url) {
            if (iframe) { iframe.style.display = 'block'; iframe.src = url; }
          } else if (articleUrl) {
            window.location.href = articleUrl;
            return;
          }

          modal.style.display = 'flex';
        }

        function closeVideoModal() {
          var modal = document.getElementById('video-player-modal');
          var iframe = document.getElementById('video-modal-iframe');
          var videoPlayer = document.getElementById('video-modal-player');
          if (modal) modal.style.display = 'none';
          if (iframe) iframe.src = '';
          if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.src = '';
          }
        }

        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') closeVideoModal();
        });
      </script>
    `;

  return this._layout(
    `<div class="home-transparent-block">` +
      lead +
      sectionPopular +
      banner1Abad +
      sectionGridBlocks +
      sectionPrayerWidget +
      videoModalHtml +
      "</div>",
    "Beranda",
    ctx,
    "home"
  );
}
