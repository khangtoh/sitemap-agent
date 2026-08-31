# Fixture example run

`sitemap.json` and `visual.html` here are **real artifacts** of a crawl the CLI
ran against the tiny static site in [`site/`](site) — not hand-written files.
`site/` exercises the behaviours the spec cares about: nested paths (`/a/1`,
`/b/1`), a self-link and a fragment link that dedupe onto `/`, a `utm_source`
query parameter that canonicalization strips, an off-domain link, a `mailto:`
link, and `/private/secret` which `site/robots.txt` disallows.

## Reproduce it

```bash
bun run examples/fixture/serve.ts 8787 &          # serve site/ on :8787
bun run bin/sitemap-agent.ts crawl http://127.0.0.1:8787/ \
  --max-depth 3 --delay-ms 0 \
  --output examples/fixture/sitemap.json --render
kill %1
```

That prints the run summary and writes both files next to this README
(`--render` puts `visual.html` beside `--output`).

## What the committed run produced

```
Pages: 7
Max depth: 2
Errors: 0
```

Seven nodes — `/`, `/a`, `/a/1`, `/about`, `/b`, `/b/1`, `/b/2`. The external,
`mailto:`, and robots-disallowed URLs are absent from the graph, and
`/b/2?utm_source=newsletter` canonicalized onto `/b/2` rather than becoming a
second node.

`visual.html` embeds that graph inline, so it opens offline straight from
disk:

```bash
open examples/fixture/visual.html      # macOS; xdg-open on Linux
```

Regenerate the visual alone from the committed JSON with:

```bash
bun run bin/sitemap-agent.ts render examples/fixture/sitemap.json \
  --out examples/fixture/visual.html
```

Note the crawl bakes `127.0.0.1:8787` into every node URL, so a rerun on a
different port produces a different — equally valid — graph.
