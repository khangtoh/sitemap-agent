#!/usr/bin/env bun
// Serves examples/fixture/site as a tiny static site so the committed example
// artifacts come from a real HTTP crawl, not a hand-written JSON file.
// Usage: bun run examples/fixture/serve.ts [port]
const root = new URL("./site/", import.meta.url).pathname;
const port = Number(Bun.argv[2] ?? 8787);

const server = Bun.serve({
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url);
    for (const candidate of candidates(pathname)) {
      const file = Bun.file(root + candidate);
      if (await file.exists()) return new Response(file);
    }
    return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain" } });
  },
});

console.log(`fixture site on http://127.0.0.1:${server.port}/`);

/** Map a request path onto the flat/nested files under site/. */
function candidates(pathname: string): string[] {
  const path = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!path) return ["index.html"];
  return [path, `${path}.html`, `${path}/index.html`];
}
