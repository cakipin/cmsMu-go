import statsRouter from "../apps/cms-api/src/modules/stats/stats.router.ts";

async function runTest() {
  console.log("🧪 Testing Pure Cloudflare GraphQL Analytics & Zero-D1-Read Router Efficiency...");

  let d1QueryCount = 0;
  const executedQueries = [];

  const mockD1 = {
    prepare: (query) => {
      executedQueries.push(query);
      const stmt = {
        bind: (...args) => stmt,
        first: async (col) => {
          d1QueryCount++;
          if (col === "total") return 1000;
          if (col === "count") return 42;
          if (col === "c") return 25;
          return { count: 42, total: 1000, c: 25 };
        },
        all: async () => {
          d1QueryCount++;
          return {
            results: [
              { month: "2026-10", count: 42, day: "2026-10-23", views: 100, visitors: 42, date: "2026-10-23" },
            ],
          };
        },
        raw: async () => {
          d1QueryCount++;
          return [[42]];
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
    CLOUDFLARE_API_TOKEN: "mock_cf_token",
    CLOUDFLARE_ZONE_ID: "mock_zone_id",
  };

  // Mock global fetch for Cloudflare GraphQL API
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.includes("api.cloudflare.com/client/v4/graphql")) {
      return {
        ok: true,
        json: async () => ({
          data: {
            viewer: {
              zones: [
                {
                  httpRequestsAdaptiveGroups: [{ count: 25 }],
                  httpRequests1dGroups: [
                    {
                      dimensions: { date: "2026-10-26" },
                      sum: { requests: 120, pageViews: 85 },
                      uniq: { uniques: 45 },
                    },
                  ],
                },
              ],
            },
          },
        }),
      };
    }
    return originalFetch(input, init);
  };

  // Test 1: Hit /ping -> MUST be 0 D1 queries (pure edge tracking)
  console.log("\n--- Test 1: /ping (Zero D1 Read & Write) ---");
  const reqPing = new Request("http://localhost/ping", { method: "POST" });
  const resPing = await statsRouter.fetch(reqPing, mockEnv);
  const dataPing = await resPing.json();
  console.log("Ping response:", dataPing, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries for /ping, got ${d1QueryCount}`);
  if (dataPing.tracking !== "cloudflare_edge") throw new Error("Expected tracking: cloudflare_edge");

  // Test 2: Hit /realtime -> MUST be 0 D1 queries (pure Cloudflare GraphQL / KV)
  console.log("\n--- Test 2: /realtime (Zero D1 Read & Write) ---");
  const reqRt = new Request("http://localhost/realtime");
  const resRt = await statsRouter.fetch(reqRt, mockEnv);
  const dataRt = await resRt.json();
  console.log("Realtime response:", dataRt, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries for /realtime, got ${d1QueryCount}`);

  // Test 3: Hit /history -> MUST be 0 D1 queries (pure Cloudflare GraphQL / KV)
  console.log("\n--- Test 3: /history (Zero D1 Read & Write) ---");
  const reqHist = new Request("http://localhost/history");
  const resHist = await statsRouter.fetch(reqHist, mockEnv);
  const dataHist = await resHist.json();
  console.log("History response:", dataHist, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries for /history, got ${d1QueryCount}`);

  // Test 4: Hit /cloudflare with token -> MUST be 0 D1 queries and configured: true
  console.log("\n--- Test 4: /cloudflare (Zero D1 Read & Write) ---");
  const reqCf = new Request("http://localhost/cloudflare");
  const resCf = await statsRouter.fetch(reqCf, mockEnv);
  const dataCf = await resCf.json();
  console.log("Cloudflare response (configured):", dataCf, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries for /cloudflare, got ${d1QueryCount}`);
  if (dataCf.configured !== true) throw new Error("Expected configured=true when token provided");

  // Test 5: Hit /dashboard first time (Content entity counts only - NEVER daily_stats/visitors)
  console.log("\n--- Test 5: /dashboard (Entity counts only, RAM Cache) ---");
  const d1BeforeDash = d1QueryCount;
  const reqDash1 = new Request("http://localhost/dashboard");
  const resDash1 = await statsRouter.fetch(reqDash1, mockEnv);
  const dataDash1 = await resDash1.json();
  const d1AfterDash1 = d1QueryCount;
  console.log("Dashboard hit 1:", dataDash1, "D1 queries:", d1AfterDash1 - d1BeforeDash);

  // Assert no queries touched daily_stats or visitors
  for (const q of executedQueries) {
    if (typeof q === "string" && (q.toLowerCase().includes("daily_stats") || q.toLowerCase().includes("visitors"))) {
      throw new Error(`Forbidden query detected touching daily_stats or visitors: ${q}`);
    }
  }

  // Test 6: Hit /dashboard second time (RAM cache hit -> 0 additional D1 queries)
  const reqDash2 = new Request("http://localhost/dashboard");
  const resDash2 = await statsRouter.fetch(reqDash2, mockEnv);
  const dataDash2 = await resDash2.json();
  console.log("Dashboard hit 2 (RAM):", dataDash2, "D1 queries:", d1QueryCount);

  if (d1QueryCount !== d1AfterDash1) throw new Error("Expected 0 additional D1 query on second dashboard hit (RAM cache)");
  if (!dataDash2.cached || dataDash2.source !== "ram") throw new Error("Expected cached=true and source=ram");

  console.log("\n✅ ALL TESTS PASSED! Pure Cloudflare GraphQL Analytics verified with 0 D1 reads/writes for traffic!");
}

runTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
