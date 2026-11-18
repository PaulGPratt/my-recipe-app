// Checks the offline snapshot boundary and every referenced static resource.
// Optional: node scripts/check-o4k9-preview.mjs http://127.0.0.1:3050
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.join(repo, "frontend/public/o4k9");
const pageNames = await fs.readdir(path.join(root, "pages"));
const roots = [
  "index.html",
  "app.js",
  "routes.js",
  "styles.css",
  "preview.js",
  "preview.css",
  ...pageNames.map((n) => `pages/${n}`),
];
const reachable = new Set(roots);
const pending = [...roots];
const problems = [];
while (pending.length) {
  const name = pending.pop();
  let bytes;
  try {
    bytes = await fs.readFile(path.join(root, name));
  } catch {
    problems.push(`Missing resource: ${name}`);
    continue;
  }
  if (!/\.(html|css|js)$/.test(name)) continue;
  const source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (name.endsWith(".html")) {
    for (const match of source.matchAll(
      /<(script|iframe|img|form)\b[^>]*>/gi,
    )) {
      const tag = match[0],
        kind = match[1].toLowerCase();
      if (
        kind === "script" &&
        !/src="\/o4k9\/(preview|app|routes)\.js"/.test(tag)
      )
        problems.push(`${name}: unexpected script`);
      if (kind === "iframe" && name !== "index.html")
        problems.push(`${name}: embedded live frame`);
      if (kind === "img" && /(?:src|srcset)="https?:\/\//i.test(tag))
        problems.push(`${name}: remote image`);
      if (kind === "form" && /action="https?:\/\//i.test(tag))
        problems.push(`${name}: remote form action`);
    }
    if (
      !/connect-src 'none'/.test(source) ||
      !/form-action 'none'/.test(source)
    )
      problems.push(`${name}: missing offline CSP`);
    if (
      !/<meta\b(?=[^>]*name="robots")(?=[^>]*content="noindex,nofollow)[^>]*>/i.test(
        source,
      )
    )
      problems.push(`${name}: missing noindex`);
  }
  if (name.endsWith(".css") && /url\([\s"']*https?:\/\//i.test(source))
    problems.push(`${name}: remote CSS resource`);
  for (const match of source.matchAll(
    /\/o4k9\/files\/([a-f0-9]{20}\.[a-z0-9]+)/g,
  )) {
    const next = `files/${match[1]}`;
    if (!reachable.has(next)) {
      reachable.add(next);
      pending.push(next);
    }
  }
}
const origin = process.argv[2];
const http = [];
if (origin) {
  const paths = ["/o4k9", ...[...reachable].map((n) => `/o4k9/${n}`)];
  // Bounded concurrency prevents a local development server being flooded.
  for (let i = 0; i < paths.length; i += 12) {
    await Promise.all(
      paths.slice(i, i + 12).map(async (pathname) => {
        const response = await fetch(new URL(pathname, origin));
        http.push({ path: pathname, status: response.status });
        if (response.status !== 200)
          problems.push(`${pathname}: HTTP ${response.status}`);
        if (!response.headers.get("x-robots-tag")?.includes("noindex"))
          problems.push(`${pathname}: missing noindex header`);
        await response.arrayBuffer();
      }),
    );
  }
  for (const pathname of ["/", "/o4k9/"]) {
    const response = await fetch(new URL(pathname, origin), {
      redirect: "manual",
    });
    const location = response.headers.get("location");
    http.push({ path: pathname, status: response.status, location });
    if (!location?.endsWith(pathname === "/" ? "/home" : "/o4k9"))
      problems.push(`${pathname}: unexpected redirect`);
  }
}
const result = {
  checkedOn: new Date().toISOString(),
  snapshots: pageNames.length,
  resources: reachable.size,
  problems,
  http,
};
console.log(
  JSON.stringify(
    {
      snapshots: result.snapshots,
      resources: result.resources,
      problems,
      httpRequests: http.length,
    },
    null,
    2,
  ),
);
if (origin)
  await fs.writeFile(
    path.join(repo, "docs/o4k9-route-checks.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
if (problems.length) process.exitCode = 1;
