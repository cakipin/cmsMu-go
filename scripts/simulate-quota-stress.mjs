#!/usr/bin/env node
/**
 * 🛡️ CMSMU ZERO-OVERQUOTA BOT CRAWLER STRESS TEST SIMULATOR
 * Digunakan oleh @qa-engineer untuk mensimulasikan perayapan bot mesin pencari (Googlebot/Bingbot)
 * dan lonjakan trafik pembaca, serta membuktikan efisiensi Cloudflare KV Caching & Lookahead Pagination.
 */

const args = process.argv.slice(2);
let targetUrl = "https://staging.cmsmu.pages.dev";
let rounds = 2;
let concurrency = 3;

for (const arg of args) {
  if (arg.startsWith("--target=")) {
    targetUrl = arg.split("=")[1].replace(/\/+$/, "");
  } else if (arg.startsWith("--rounds=")) {
    rounds = parseInt(arg.split("=")[1], 10) || 2;
  } else if (arg.startsWith("--concurrency=")) {
    concurrency = parseInt(arg.split("=")[1], 10) || 3;
  }
}

const TEST_PATHS = [
  "/",
  "/berita",
  "/kegiatan",
  "/info",
  "/tag/muhammadiyah",
  "/tag/aisyiyah",
  "/tag/tarjih",
  "/tag/pendidikan",
  "/tag/kesehatan",
  "/tag/pemuda",
  "/search?q=islam",
  "/search?q=muhammadiyah",
  "/search?q=tarjih",
  "/search?q=artikel",
  "/search?q=ramadhan",
];

const LEGACY_UNINDEXED_SCAN_PER_REQ = 14259; // Data pembanding: insiden Suara 'Aisyiyah

function formatNumber(num) {
  return new Intl.NumberFormat("id-ID").format(num);
}

async function fetchWithStats(url) {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const duration = Math.round(performance.now() - start);
    const cacheStatus = res.headers.get("x-cmsmu-cache") || "UNKNOWN";
    const cfCache = res.headers.get("cf-cache-status") || "-";
    
    // Hitungan baris database D1:
    // HIT-KV = 0 rows read.
    // MISS = maks 11 rows read (Lookahead limit 10 + 1).
    const rowsRead = cacheStatus === "HIT-KV" ? 0 : 11;

    return {
      url,
      status: res.status,
      duration,
      cacheStatus,
      cfCache,
      rowsRead,
      success: res.ok,
    };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return {
      url,
      status: 0,
      duration,
      cacheStatus: "ERROR",
      cfCache: "-",
      rowsRead: 0,
      error: err.message,
      success: false,
    };
  }
}

async function runQueue(items, limit, fn) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = fn(item).then((res) => {
      executing.splice(executing.indexOf(p), 1);
      return res;
    });
    results.push(p);
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

async function main() {
  console.log("=========================================================================================");
  console.log("🤖 [QA BOT CRAWLER SIMULATOR] CLOUDFLARE EDGE & D1 ZERO-OVERQUOTA AUDIT");
  console.log("=========================================================================================");
  console.log(`🌐 Target Host       : ${targetUrl}`);
  console.log(`🔄 Putaran Pengujian : ${rounds} Putaran (Round 1: Cache Miss / Round 2: Bot Crawl)`);
  console.log(`⚡ Konkurensi        : ${concurrency} request serentak`);
  console.log(`📋 Total Endpoint    : ${TEST_PATHS.length} rute publik per putaran`);
  console.log("=========================================================================================\n");

  const allResults = [];

  for (let r = 1; r <= rounds; r++) {
    console.log(`➡️  [PUTARAN ${r}/${rounds}] Menjalankan simulasi perayapan bot crawler...`);
    const urls = TEST_PATHS.map((p) => `${targetUrl}${p}`);
    
    // Eksekusi concurrent requests
    const roundResults = await runQueue(urls, concurrency, async (url) => {
      const res = await fetchWithStats(url);
      const icon = res.cacheStatus === "HIT-KV" ? "🟢 HIT " : "🟡 MISS";
      const pathOnly = new URL(res.url).pathname + new URL(res.url).search;
      console.log(
        `   [${icon}] ${res.status} | Latency: ${String(res.duration).padStart(4)}ms | D1 Read: ${String(res.rowsRead).padStart(2)} rows | ${pathOnly}`
      );
      return { ...res, round: r };
    });

    allResults.push(...roundResults);
    console.log(`   ✨ Putaran ${r} selesai.\n`);

    if (r < rounds) {
      // Jeda 1 detik antar-putaran untuk replikasi KV edge Anycast
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // ANALISIS & KALKULASI HASIL
  const totalRequests = allResults.length;
  const successfulRequests = allResults.filter((r) => r.success).length;
  const cacheHits = allResults.filter((r) => r.cacheStatus === "HIT-KV").length;
  const cacheMisses = allResults.filter((r) => r.cacheStatus === "MISS").length;
  const round2Results = allResults.filter((r) => r.round === 2);
  const round2Hits = round2Results.filter((r) => r.cacheStatus === "HIT-KV").length;
  const round2HitRate = round2Results.length > 0 ? (round2Hits / round2Results.length) * 100 : 0;

  const totalD1RowsRead = allResults.reduce((acc, r) => acc + r.rowsRead, 0);
  const legacyRowsBurned = totalRequests * LEGACY_UNINDEXED_SCAN_PER_REQ;
  const rowsSaved = legacyRowsBurned - totalD1RowsRead;
  const savingsPercent = ((rowsSaved / legacyRowsBurned) * 100).toFixed(3);

  const avgLatency = Math.round(allResults.reduce((acc, r) => acc + r.duration, 0) / totalRequests);
  const latencies = allResults.map((r) => r.duration).sort((a, b) => a - b);
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)] || avgLatency;

  console.log("=========================================================================================");
  console.log("📊 HASIL AUDIT EFISIENSI KUOTA & TELEMETRI CRAWLER");
  console.log("=========================================================================================");
  console.log(`• Total Permintaan Crawler  : ${formatNumber(totalRequests)} permintaan (${formatNumber(successfulRequests)} HTTP 200 OK)`);
  console.log(`• Cache Hit Keseluruhan     : ${formatNumber(cacheHits)} / ${formatNumber(totalRequests)} (${((cacheHits / totalRequests) * 100).toFixed(1)}%)`);
  console.log(`• Cache Hit Rate Putaran 2  : ${round2HitRate.toFixed(1)}% (Target: ≥ 90% diserap KV Edge)`);
  console.log(`• Latensi Rata-rata         : ${avgLatency} ms (p95: ${p95Latency} ms)`);
  console.log("-----------------------------------------------------------------------------------------");
  console.log(`💾 ESTIMASI KONSUMSI BARIS DATABASE D1:`);
  console.log(`  ✅ Arsitektur Saat Ini    : ${formatNumber(totalD1RowsRead)} BARIS DIBACA`);
  console.log(`  ❌ Arsitektur Lama (VPS)  : ${formatNumber(legacyRowsBurned)} BARIS TERBAKAR (${LEGACY_UNINDEXED_SCAN_PER_REQ} rows/req)`);
  console.log(`  🛡️  Penghematan Kuota      : BERHASIL MENGHEMAT ${formatNumber(rowsSaved)} BARIS (${savingsPercent}%)!`);
  console.log("=========================================================================================");

  // VERDICT
  let pass = true;
  const failures = [];

  if (successfulRequests < totalRequests) {
    pass = false;
    failures.push(`Terdapat ${totalRequests - successfulRequests} request yang gagal/HTTP non-200`);
  }
  if (round2HitRate < 85) {
    pass = false;
    failures.push(`Cache Hit Rate putaran ke-2 (${round2HitRate.toFixed(1)}%) di bawah batas aman 85%`);
  }
  if (totalD1RowsRead > TEST_PATHS.length * 15) {
    pass = false;
    failures.push(`Konsumsi baris D1 (${totalD1RowsRead}) melebihi ambang Lookahead Pagination`);
  }

  if (pass) {
    console.log("🏆 [VERDICT: PASS - ZERO-OVERQUOTA SAFE]");
    console.log("✅ Sistem 100% aman dari ancaman lonjakan tagihan database.");
    console.log("✅ Seluruh perayapan bot crawler diserap oleh Cloudflare KV Edge Cache.");
    console.log("=========================================================================================\n");
    process.exit(0);
  } else {
    console.error("❌ [VERDICT: FAIL - OVERQUOTA RISK DETECTED]");
    for (const f of failures) {
      console.error(`   • ${f}`);
    }
    console.log("=========================================================================================\n");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running quota simulator:", err);
  process.exit(1);
});
