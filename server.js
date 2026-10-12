import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier, createConcepts } from "./src/agent.js";
import { AppError } from "./src/errors.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(projectRoot, "public");
const port = Number(process.env.PORT || 4174);
const assets = new Map([
  ["/", ["index.html", "text/html"]],
  ["/app.js", ["app.js", "text/javascript"]],
  ["/styles.css", ["styles.css", "text/css"]],
  ["/assets/encore-cultural-constellation.png", ["assets/encore-cultural-constellation.png", "image/png"]]
]);

function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 20_000) throw new AppError("Request is too large.", 413);
  }
  try { return JSON.parse(body || "{}"); }
  catch { throw new AppError("Request body must be valid JSON."); }
}

export async function handler(req, res) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  try {
    if (pathname === "/api/status" && req.method === "GET") {
      return sendJson(res, 200, { qlooConfigured: Boolean(process.env.QLOO_API_KEY), qlooKeyLength: process.env.QLOO_API_KEY?.length || 0, qlooBaseUrl: process.env.QLOO_BASE_URL || "default", sampleModeAvailable: true });
    }
    if (pathname === "/api/concepts" && req.method === "POST") {
      return sendJson(res, 200, await createConcepts(await readJson(req), {
        apiKey: process.env.QLOO_API_KEY,
        baseUrl: process.env.QLOO_BASE_URL
      }));
    }
    if (pathname === "/api/dossier" && req.method === "POST") {
      return sendJson(res, 200, buildDossier(await readJson(req)));
    }
    const asset = assets.get(pathname);
    if (!asset || req.method !== "GET") throw new AppError("Not found.", 404);
    const data = await readFile(path.join(publicRoot, asset[0]));
    const contentType = asset[1].startsWith("image/") ? asset[1] : `${asset[1]}; charset=utf-8`;
    res.writeHead(200, { "content-type": contentType, "cache-control": "no-store" });
    res.end(data);
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    sendJson(res, status, { error: status === 500 ? "Encore could not complete this request." : error.message });
  }
}

export default handler;
export const server = http.createServer(handler);

if (process.env.NODE_ENV !== "test" && process.env.VERCEL !== "1") {
  server.listen(port, () => console.log(`Encore is running at http://localhost:${port}`));
}
