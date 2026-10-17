import { Hono } from "hono";
import type { Bindings } from "../../types";

export const starterPluginRouter = new Hono<{ Bindings: Bindings }>();

// 1. Endpoint Info & Health Check
starterPluginRouter.get("/info", c => {
  return c.json({
    success: true,
    plugin: "starter-plugin",
    status: "active",
    message: "Starter Plugin API berjalan normal di atas CMSMu-Go.",
    timestamp: new Date().toISOString(),
  });
});

// 2. Endpoint Contoh Pengambilan Data
starterPluginRouter.get("/items", async c => {
  try {
    // Pengembang bebas melakukan query ke c.env.DB menggunakan Drizzle ORM atau raw prepare
    const demoItems = [
      { id: 1, title: "Contoh Modul A", status: "enabled" },
      { id: 2, title: "Contoh Modul B", status: "pending" },
    ];
    return c.json({ success: true, data: demoItems });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. Endpoint Contoh Pemrosesan Aksi
starterPluginRouter.post("/items", async c => {
  try {
    const body = await c.req.json();
    return c.json({
      success: true,
      message: "Data berhasil diproses oleh Starter Plugin!",
      received: body,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});
