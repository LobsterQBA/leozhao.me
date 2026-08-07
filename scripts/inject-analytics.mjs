import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const analyticsPath = "/_vercel/insights/script.js";
const analyticsTag = `<script defer src="${analyticsPath}"></script>`;
const checkOnly = process.argv.includes("--check");
const root = process.cwd();
const ignoredDirectories = new Set([".git", ".gstack", ".vercel", "node_modules"]);

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

const htmlFiles = await findHtmlFiles(root);
const missing = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (html.includes(analyticsPath)) continue;

  if (!html.includes("</body>")) {
    throw new Error(`Cannot inject analytics because ${path.relative(root, file)} has no closing body tag.`);
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
