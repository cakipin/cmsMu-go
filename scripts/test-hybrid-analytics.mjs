import statsRouter from "../apps/cms-api/src/modules/stats/stats.router.ts";

async function runTest() {
  console.log("🧪 Testing Hybrid Analytics (Cloudflare Edge & Google Analytics 4) Zero-D1 Efficiency...");

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
              { key: "ga4_property_id", value: "12345678" },
              { key: "ga_client_email", value: "test@project.iam.gserviceaccount.com" }
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

  // Generate valid PKCS#8 RSA PEM key for testing crypto.subtle signing
  const { generateKeyPairSync } = await import("crypto");
  const { privateKey: validTestPrivateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const mockEnv = {
    DB: mockD1,
    CACHE: mockKv,
    CLOUDFLARE_API_TOKEN: "mock_cf_token",
    CLOUDFLARE_ZONE_ID: "mock_zone_id",
    GA4_PROPERTY_ID: "12345678",
    GA_CLIENT_EMAIL: "test@project.iam.gserviceaccount.com",
    GA_PRIVATE_KEY: validTestPrivateKey
  };

  // Mock Global fetch for both Cloudflare GraphQL & Google API
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;

    // 1. Mock Cloudflare GraphQL
    if (url.includes("api.cloudflare.com/client/v4/graphql")) {
      return {
        ok: true,
        json: async () => ({
          data: {
            viewer: {
              zones: [
                {
                  httpRequestsAdaptiveGroups: [{ count: 25, dimensions: { clientCountryName: "Indonesia" } }],
                  httpRequests1dGroups: [
                    {
                      dimensions: { date: "2026-10-26" },
                      sum: { requests: 120, pageViews: 85, bytes: 50000 },
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

    // 2. Mock Google OAuth2 Token
    if (url.includes("oauth2.googleapis.com/token")) {
      return {
        ok: true,
        json: async () => ({
          access_token: "mock_google_access_token",
          expires_in: 3600,
          token_type: "Bearer"
        })
      };
    }

    // 3. Mock GA4 Data API Realtime Report
    if (url.includes("runRealtimeReport")) {
      return {
        ok: true,
        json: async () => ({
          rows: [
            { metricValues: [{ value: "14" }] }
          ]
        })
      };
    }

    // 4. Mock GA4 Data API runReport
    if (url.includes("runReport")) {
      return {
        ok: true,
        json: async () => ({
          rows: [
            {
              dimensionValues: [{ value: "20261026" }],
              metricValues: [
                { value: "120" },  // activeUsers
                { value: "150" },  // sessions
                { value: "480" },  // screenPageViews
                { value: "18000" }, // userEngagementDuration
                { value: "0.28" }  // bounceRate
              ]
            }
          ]
        })
      };
    }

    return originalFetch(input, init);
  };

  // TEST 1: /ping -> 0 D1 queries
  console.log("\n--- Test 1: /ping (Zero D1 Read & Write) ---");
  const reqPing = new Request("http://localhost/ping", { method: "POST" });
  const resPing = await statsRouter.fetch(reqPing, mockEnv);
  const dataPing = await resPing.json();
  console.log("Ping response:", dataPing, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries for /ping, got ${d1QueryCount}`);
  if (dataPing.tracking !== "cloudflare_edge") throw new Error("Expected tracking: cloudflare_edge");

  // TEST 2: /cloudflare -> 0 D1 queries
  console.log("\n--- Test 2: /cloudflare (Zero D1 Read & Write) ---");
  const reqCf = new Request("http://localhost/cloudflare");
  const resCf = await statsRouter.fetch(reqCf, mockEnv);
  const dataCf = await resCf.json();
  console.log("Cloudflare response:", { configured: dataCf.configured, source: dataCf.source }, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries for /cloudflare, got ${d1QueryCount}`);
  if (dataCf.configured !== true) throw new Error("Expected configured=true for cloudflare");

  // TEST 3: /history?source=cloudflare -> 0 D1 queries
  console.log("\n--- Test 3: /history?source=cloudflare (Zero D1 Read & Write) ---");
  const reqHistCf = new Request("http://localhost/history?source=cloudflare");
  const resHistCf = await statsRouter.fetch(reqHistCf, mockEnv);
  const dataHistCf = await resHistCf.json();
  console.log("History CF response:", { source: dataHistCf.source, count: dataHistCf.dailyStats?.length }, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries for /history?source=cloudflare, got ${d1QueryCount}`);

  // TEST 4: /history?source=ga4 -> 0 D1 queries
  console.log("\n--- Test 4: /history?source=ga4 (Zero D1 Read & Write) ---");
  const reqHistGa4 = new Request("http://localhost/history?source=ga4");
  const resHistGa4 = await statsRouter.fetch(reqHistGa4, mockEnv);
  const dataHistGa4 = await resHistGa4.json();
  console.log("History GA4 response:", { source: dataHistGa4.source, count: dataHistGa4.dailyStats?.length }, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries for /history?source=ga4, got ${d1QueryCount}`);
  if (dataHistGa4.source !== "google_analytics_4") throw new Error("Expected source: google_analytics_4");

  // TEST 5: /history?source=ga4 (Second Hit - RAM Cache) -> 0 additional D1 queries
  console.log("\n--- Test 5: /history?source=ga4 (RAM Cache Hit) ---");
  const reqHistGa4_2 = new Request("http://localhost/history?source=ga4");
  const resHistGa4_2 = await statsRouter.fetch(reqHistGa4_2, mockEnv);
  const dataHistGa4_2 = await resHistGa4_2.json();
  console.log("History GA4 Hit 2:", { source: dataHistGa4_2.source, cached: dataHistGa4_2.cached }, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries on RAM cache, got ${d1QueryCount}`);
  if (dataHistGa4_2.cached !== true) throw new Error("Expected cached=true on second hit");

  // TEST 6: /ga4 endpoint -> 0 D1 queries
  console.log("\n--- Test 6: /ga4 endpoint (Zero D1 Read & Write) ---");
  const reqGa4 = new Request("http://localhost/ga4");
  const resGa4 = await statsRouter.fetch(reqGa4, mockEnv);
  const dataGa4 = await resGa4.json();
  console.log("GA4 endpoint response:", { source: dataGa4.source, configured: dataGa4.configured }, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== 0) throw new Error(`Expected 0 D1 queries for /ga4, got ${d1QueryCount}`);

  // TEST 7: /dashboard first and second hit -> 0 queries to visitors/daily_stats
  console.log("\n--- Test 7: /dashboard (Entity counts only, RAM Cache) ---");
  const d1BeforeDash = d1QueryCount;
  const reqDash1 = new Request("http://localhost/dashboard");
  const resDash1 = await statsRouter.fetch(reqDash1, mockEnv);
  const dataDash1 = await resDash1.json();
  const d1AfterDash1 = d1QueryCount;
  console.log("Dashboard hit 1:", dataDash1, "D1 queries:", d1AfterDash1 - d1BeforeDash);

  for (const q of executedQueries) {
    if (typeof q === "string" && (q.toLowerCase().includes("daily_stats") || q.toLowerCase().includes("visitors"))) {
      throw new Error(`Forbidden query detected touching daily_stats or visitors: ${q}`);
    }
  }

  const reqDash2 = new Request("http://localhost/dashboard");
  const resDash2 = await statsRouter.fetch(reqDash2, mockEnv);
  const dataDash2 = await resDash2.json();
  console.log("Dashboard hit 2 (RAM):", dataDash2, "D1 queries:", d1QueryCount);
  if (d1QueryCount !== d1AfterDash1) throw new Error("Expected 0 additional D1 query on second dashboard hit");

  console.log("\n✅ ALL TESTS PASSED! Hybrid Analytics (Cloudflare & GA4) verified with ZERO D1 rows read & written!");
}

runTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
