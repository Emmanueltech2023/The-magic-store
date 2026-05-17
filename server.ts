import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Use process.cwd() as the base directory so the server bundle works
// when built to CommonJS or ESM formats.
const __dirname = process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

 // ImageKit Config
const publicKey = process.env.VITE_IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.VITE_IMAGEKIT_URL_ENDPOINT;

if (!publicKey || !privateKey || !urlEndpoint) {
  console.error("❌ Error: ImageKit environment variables are missing!");
}

const imagekit = new ImageKit({
  publicKey: publicKey || "",
  privateKey: privateKey || "",
  urlEndpoint: urlEndpoint || "",
});

  // API Routes
  app.get("/api/imagekit/auth", (req, res) => {
    try {
      const result = imagekit.getAuthenticationParameters();
      res.json(result);
    } catch (error) {
      console.error("ImageKit Auth Error:", error);
      res.status(500).send("Auth failed");
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ The Magic Store is running on http://localhost:${PORT}`);
  });
}

startServer();
