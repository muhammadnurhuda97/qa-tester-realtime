import express, { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import cors from "cors";

const DATA_FILE = path.join(process.cwd(), "checklist_data.json");

// ─── SSE: daftar semua client yang sedang terhubung ───────────────────────────
const sseClients = new Set<Response>();

function broadcastUpdate(data: unknown) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  console.log("Initializing Aksara QA Server...");
  const app = express();
  const PORT = 5001;

  app.use(cors());
  app.use(express.json());

  // Initialize data file if it doesn't exist
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }

  // ── SSE endpoint: client subscribe untuk real-time update ──────────────────
  app.get("/api/checklist/stream", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Kirim data terkini saat client baru konek
    fs.readFile(DATA_FILE, "utf-8")
      .then((raw) => {
        res.write(`data: ${raw}\n\n`);
      })
      .catch(() => {
        res.write(`data: []\n\n`);
      });

    sseClients.add(res);

    // Hapus client saat disconnect
    req.on("close", () => {
      sseClients.delete(res);
    });
  });
  // ──────────────────────────────────────────────────────────────────────────

  // GET: baca semua data
  app.get("/api/checklist", async (_req: Request, res: Response) => {
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read checklist data" });
    }
  });

  // POST: import/replace seluruh data (dari /internal/input)
  app.post("/api/checklist", async (req: Request, res: Response) => {
    try {
      const newData = req.body;
      const serialized = JSON.stringify(newData, null, 2);
      await fs.writeFile(DATA_FILE, serialized);

      // REAL-TIME: push ke semua tester yang sedang online
      broadcastUpdate(newData);

      res.json({ status: "success" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save checklist data" });
    }
  });

  // POST: update status satu item
  app.post("/api/checklist/update", async (req: Request, res: Response) => {
    try {
      const { groupId, itemId, status, testedBy } = req.body;
      const rawData = await fs.readFile(DATA_FILE, "utf-8");
      let groups = JSON.parse(rawData);

      groups = groups.map((group: any) => {
        if (group.id === groupId) {
          return {
            ...group,
            items: group.items.map((item: any) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  status,
                  testedBy: status !== "NOT_TESTED" ? testedBy : undefined,
                };
              }
              return item;
            }),
          };
        }
        return group;
      });

      await fs.writeFile(DATA_FILE, JSON.stringify(groups, null, 2));

      // REAL-TIME: push ke semua tester
      broadcastUpdate(groups);

      res.json({ status: "success", groups });
    } catch (error) {
      res.status(500).json({ error: "Failed to update item status" });
    }
  });

  // Detect if we are running the bundled version in dist/
  const isBundled = import.meta.url.includes('/dist/') || import.meta.url.includes('\\dist\\');
  const isProduction = process.env.NODE_ENV === "production" || isBundled;

  // Vite middleware for development
  if (!isProduction) {
    console.log("Mode: DEVELOPMENT");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Mode: PRODUCTION");
    const currentPath = process.cwd();
    
    // Prioritas: Folder "dist" jika ada index.html di dalamnya
    let distPath = path.join(currentPath, "dist");
    try {
      await fs.access(path.join(distPath, "index.html"));
      console.log("Serving from 'dist' folder");
    } catch {
      // Jika tidak ada dist/index.html, baru cek di root
      distPath = currentPath;
      console.log("Serving from 'root' folder");
    }

    console.log(`Static Files Path: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
