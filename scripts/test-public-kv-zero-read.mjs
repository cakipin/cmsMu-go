import publicRouter from "../apps/cms-api/src/modules/public/public.router.ts";

async function runTest() {
  console.log("===================================================================");
  console.log("🧪 TESTING ZERO-OVERQUOTA PUBLIC KV CACHING & LOOKAHEAD PAGINATION");
  console.log("===================================================================");

  let d1QueryCount = 0;
  let d1RowsReadCount = 0;
  const executedQueries = [];

  const mockD1 = {
    prepare: (query) => {
      executedQueries.push(query);
      const stmt = {
        bind: (...args) => stmt,
        first: async (col) => {
          d1QueryCount++;
          d1RowsReadCount += 1;
          return { total: 50, count: 50 };
        },
        all: async () => {
          d1QueryCount++;
          // Simulate returned rows based on query
          if (query.includes("DISTINCT category")) {
            d1RowsReadCount += 3;
            return { results: [{ category: "Berita" }, { category: "Opini" }, { category: "Kajian" }] };
          }
          if (query.includes("DISTINCT tags")) {
            d1RowsReadCount += 2;
            return { results: [{ tags: "muhammadiyah,aisyiyah" }] };
          }
          if (query.includes("FROM posts")) {
            // Simulated 11 rows returned for Lookahead (limit 10 + 1)
            const samplePosts = Array.from({ length: 11 }, (_, i) => ({
              id: i + 1,
              title: `Artikel Uji Ke-${i + 1}`,
              slug: `artikel-uji-ke-${i + 1}`,
              body: `<p>Konten artikel pengujian ke-${i + 1}</p>`,
              category: "Berita",
              status: "publish",
              created_at: new Date(Date.now() - i * 3600000).toISOString(),
            }));
            d1RowsReadCount += samplePosts.length;
            return { results: samplePosts };
          }
          d1RowsReadCount += 5;
          return { results: [] };
        },
        raw: async () => {
          d1QueryCount++;
          d1RowsReadCount += 1;
          return [];
        },
        run: async () => {
          d1QueryCount++;
          return { success: true };
        },
      };
      return stmt;
    },
  };

  const kvStore = new Map();
  const mockKv = {
    get: async (key) => kvStore.get(key) || null,
    put: async (key, val) => { kvStore.set(key, val); },
  };

  const mockEnv = {
    DB: mockD1,
    CACHE: mockKv,
    cache: mockKv,
  };

  const executionCtx = {
    waitUntil: (promise) => {
      // Execute immediately in test
      promise.catch?.(() => {});
    },
  };

  // -------------------------------------------------------------
  // TEST 1: Homepage (Hit 1 = Cache MISS, Hit 2 = Cache HIT)
  // -------------------------------------------------------------
  console.log("\n➡️  TEST 1: Homepage Route (/) KV Caching...");
  d1QueryCount = 0;
  d1RowsReadCount = 0;

  const req1 = new Request("http://localhost/");
  const res1 = await publicRouter.fetch(req1, mockEnv, executionCtx);
  const cacheHeader1 = res1.headers.get("X-Cmsmu-Cache");
  console.log(`   Hit 1 Response: ${res1.status}, Cache Header: ${cacheHeader1}, D1 Queries: ${d1QueryCount}`);

  if (cacheHeader1 !== "MISS") {
    throw new Error(`Expected Hit 1 to be MISS, got: ${cacheHeader1}`);
  }

  // Second Hit to Homepage
  const d1QueriesBeforeHit2 = d1QueryCount;
  const d1RowsBeforeHit2 = d1RowsReadCount;

  const req2 = new Request("http://localhost/");
  const res2 = await publicRouter.fetch(req2, mockEnv, executionCtx);
  const cacheHeader2 = res2.headers.get("X-Cmsmu-Cache");
  const d1QueriesHit2 = d1QueryCount - d1QueriesBeforeHit2;
  const d1RowsHit2 = d1RowsReadCount - d1RowsBeforeHit2;

  console.log(`   Hit 2 Response: ${res2.status}, Cache Header: ${cacheHeader2}, D1 Queries: ${d1QueriesHit2}, Rows Read: ${d1RowsHit2}`);

  if (cacheHeader2 !== "HIT-KV") {
    throw new Error(`Expected Hit 2 to be HIT-KV, got: ${cacheHeader2}`);
  }
  if (d1QueriesHit2 !== 0 || d1RowsHit2 !== 0) {
    throw new Error(`Zero-Overquota Violation! Hit 2 triggered ${d1QueriesHit2} queries and ${d1RowsHit2} rows read!`);
  }
  console.log("   ✅ Homepage Zero-D1 Read on KV Cache Hit PASSED!");

  // -------------------------------------------------------------
  // TEST 2: Tag Route (/tag/muhammadiyah) (Lookahead + KV Cache)
  // -------------------------------------------------------------
  console.log("\n➡️  TEST 2: Tag Route (/tag/muhammadiyah) Lookahead & KV Caching...");
  const queriesBeforeTag = executedQueries.length;
  const d1RowsBeforeTag = d1RowsReadCount;

  const reqTag1 = new Request("http://localhost/tag/muhammadiyah");
  const resTag1 = await publicRouter.fetch(reqTag1, mockEnv, executionCtx);
  const tagCache1 = resTag1.headers.get("X-Cmsmu-Cache");
  const tagQueries = executedQueries.slice(queriesBeforeTag);

  console.log(`   Tag Hit 1: ${resTag1.status}, Cache: ${tagCache1}, Queries Executed: ${tagQueries.length}`);

  // Assert no live count(*) was executed for tag!
  const hasLiveCountInTag = tagQueries.some(q => q.toLowerCase().includes("count(*)"));
  if (hasLiveCountInTag) {
    throw new Error("Zero-Overquota Violation! Tag route executed live SELECT count(*)!");
  }
  console.log("   ✅ Tag Route Lookahead Pagination verified (0 live count(*) queries)!");

  // Tag Hit 2 (Cache HIT)
  const tagRowsBeforeHit2 = d1RowsReadCount;
  const reqTag2 = new Request("http://localhost/tag/muhammadiyah");
  const resTag2 = await publicRouter.fetch(reqTag2, mockEnv, executionCtx);
  const tagCache2 = resTag2.headers.get("X-Cmsmu-Cache");
  const tagRowsHit2 = d1RowsReadCount - tagRowsBeforeHit2;

  console.log(`   Tag Hit 2: ${resTag2.status}, Cache: ${tagCache2}, D1 Rows Read: ${tagRowsHit2}`);
  if (tagCache2 !== "HIT-KV" || tagRowsHit2 !== 0) {
    throw new Error(`Tag Hit 2 failed Zero-D1 Read! Got cache: ${tagCache2}, rows read: ${tagRowsHit2}`);
  }
  console.log("   ✅ Tag Route Zero-D1 Read on KV Cache Hit PASSED!");

  // -------------------------------------------------------------
  // TEST 3: Search Route (/search?q=islam) Lookahead & KV Caching
  // -------------------------------------------------------------
  console.log("\n➡️  TEST 3: Search Route (/search?q=islam) Lookahead & KV Caching...");
  const queriesBeforeSearch = executedQueries.length;

  const reqSearch1 = new Request("http://localhost/search?q=islam");
  const resSearch1 = await publicRouter.fetch(reqSearch1, mockEnv, executionCtx);
  const searchCache1 = resSearch1.headers.get("X-Cmsmu-Cache");
  const searchQueries = executedQueries.slice(queriesBeforeSearch);

  console.log(`   Search Hit 1: ${resSearch1.status}, Cache: ${searchCache1}, Queries: ${searchQueries.length}`);
  const hasLiveCountInSearch = searchQueries.some(q => q.toLowerCase().includes("count(*)"));
  if (hasLiveCountInSearch) {
    throw new Error("Zero-Overquota Violation! Search route executed live SELECT count(*)!");
  }
  console.log("   ✅ Search Route Lookahead Pagination verified (0 live count(*) queries)!");

  // Search Hit 2 (Cache HIT)
  const searchRowsBeforeHit2 = d1RowsReadCount;
  const reqSearch2 = new Request("http://localhost/search?q=islam");
  const resSearch2 = await publicRouter.fetch(reqSearch2, mockEnv, executionCtx);
  const searchCache2 = resSearch2.headers.get("X-Cmsmu-Cache");
  const searchRowsHit2 = d1RowsReadCount - searchRowsBeforeHit2;

  console.log(`   Search Hit 2: ${resSearch2.status}, Cache: ${searchCache2}, D1 Rows Read: ${searchRowsHit2}`);
  if (searchCache2 !== "HIT-KV" || searchRowsHit2 !== 0) {
    throw new Error(`Search Hit 2 failed Zero-D1 Read! Got cache: ${searchCache2}, rows read: ${searchRowsHit2}`);
  }
  console.log("   ✅ Search Route Zero-D1 Read on KV Cache Hit PASSED!");

  // -------------------------------------------------------------
  // TEST 4: Category Route (/berita-artikel) Lookahead & KV Caching
  // -------------------------------------------------------------
  console.log("\n➡️  TEST 4: Category Route (/berita) Lookahead & KV Caching...");
  const reqBerita1 = new Request("http://localhost/berita");
  const resBerita1 = await publicRouter.fetch(reqBerita1, mockEnv, executionCtx);
  console.log(`   Berita Hit 1: ${resBerita1.status}, Cache: ${resBerita1.headers.get("X-Cmsmu-Cache")}`);

  const beritaRowsBeforeHit2 = d1RowsReadCount;
  const reqBerita2 = new Request("http://localhost/berita");
  const resBerita2 = await publicRouter.fetch(reqBerita2, mockEnv, executionCtx);
  const beritaCache2 = resBerita2.headers.get("X-Cmsmu-Cache");
  const beritaRowsHit2 = d1RowsReadCount - beritaRowsBeforeHit2;

  console.log(`   Berita Hit 2: ${resBerita2.status}, Cache: ${beritaCache2}, D1 Rows Read: ${beritaRowsHit2}`);
  if (beritaCache2 !== "HIT-KV" || beritaRowsHit2 !== 0) {
    throw new Error(`Berita Hit 2 failed Zero-D1 Read! Got cache: ${beritaCache2}, rows read: ${beritaRowsHit2}`);
  }
  console.log("   ✅ Berita Route Zero-D1 Read on KV Cache Hit PASSED!");

  console.log("\n===================================================================");
  console.log("🎉 ALL ZERO-OVERQUOTA PUBLIC KV CACHING & LOOKAHEAD TESTS PASSED!");
  console.log("===================================================================");
}

runTest().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
