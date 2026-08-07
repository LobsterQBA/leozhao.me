import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const fallbackAnalyticsPath = "/_vercel/insights/script.js";
const analyticsMarker = "data-vercel-analytics";
const checkOnly = process.argv.includes("--check");
const root = process.cwd();
const outputRoot = path.join(root, "public");

function getAnalyticsConfig() {
  const configString =
    process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG ??
    process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG;

  if (!configString) return { scriptSrc: fallbackAnalyticsPath };

  const config = JSON.parse(configString).analytics;
  if (!config?.scriptSrc) {
    throw new Error("Vercel did not provide an Analytics script path.");
  }

  return config;
}

const analyticsConfig = getAnalyticsConfig();
const analyticsTag = `<script ${analyticsMarker}>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script><script ${analyticsMarker} defer src="${analyticsConfig.scriptSrc}"${analyticsConfig.viewEndpoint ? ` data-view-endpoint="${analyticsConfig.viewEndpoint}"` : ""}${analyticsConfig.eventEndpoint ? ` data-event-endpoint="${analyticsConfig.eventEndpoint}"` : ""}${analyticsConfig.sessionEndpoint ? ` data-session-endpoint="${analyticsConfig.sessionEndpoint}"` : ""}></script>`;

if (!checkOnly) {
  await mkdir(outputRoot, { recursive: true });
  await Promise.all([
    cp(path.join(root, "index.html"), path.join(outputRoot, "index.html")),
    cp(path.join(root, "styles.css"), path.join(outputRoot, "styles.css")),
    cp(path.join(root, "projects"), path.join(outputRoot, "projects"), {
      recursive: true,
    }),
  ]);
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

const htmlFiles = await findHtmlFiles(outputRoot);
const missing = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (html.includes(analyticsMarker)) continue;

  if (!html.includes("</body>")) {
    throw new Error(
      `Cannot inject analytics because ${path.relative(outputRoot, file)} has no closing body tag.`,
    );
  }

  missing.push(file);
  if (!checkOnly) {
    await writeFile(file, html.replace("</body>", `${analyticsTag}</body>`));
  }
}

if (checkOnly && missing.length > 0) {
  console.error(
    `${missing.length} HTML file(s) are missing the Vercel Web Analytics script. Run npm run build to inject it.`,
  );
  process.exitCode = 1;
} else {
  const action = checkOnly ? "Verified" : "Prepared";
  console.log(`${action} ${htmlFiles.length} HTML file(s) for Vercel Web Analytics.`);
}
