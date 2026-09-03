# Using `sitemap-agent`

`sitemap-agent` points at one domain, follows links from the start page, and
writes two things: `sitemap.json` — a graph of every same-domain page it
reached, with the links between them — and, on request, `visual.html`, a
single self-contained page for reading that graph in a browser.

It is a **link-following crawler**, not an SEO tool. It does not read or write
`sitemap.xml`, and it does not run JavaScript: pages are discovered from static
`<a href>` markup only, so a client-rendered SPA will look nearly empty to it.

---

## Install

The package is not on npm (`package.json` marks it `private`), so `bunx
sitemap-agent` and `bun add -g sitemap-agent` do **not** work. You need the
repo. Bun 1.4+ is the only prerequisite.

### Run it from a clone (simplest)

```bash
git clone https://github.com/khangtoh/sitemap-agent.git
cd sitemap-agent
bun install
bun run bin/sitemap-agent.ts --help
```

Everything below writes `bun run bin/sitemap-agent.ts` for this reason. If your
`bun install` produces type errors that make no sense, see
[Troubleshooting](#troubleshooting).

### Install it as a global command

From inside the clone:

```bash
bun link                        # registers this checkout globally
sitemap-agent --help            # now available from any directory
```

`bun unlink` (run from the clone) removes it again. The global command is a
symlink into your checkout, so `git pull` updates it in place — there is no
separate copy to reinstall.

---

## Try it in 30 seconds

The repo ships a small fixture site so you can see real output without
crawling anyone else's server:

```bash
bun run examples/fixture/serve.ts 8787 &          # serve the fixture on :8787
bun run bin/sitemap-agent.ts crawl http://127.0.0.1:8787/ --render
kill %1
```

```
Pages: 7
Max depth: 2
Errors: 0
Duration: 18ms
```

That leaves `sitemap.json` and `visual.html` in the current directory. Open the
HTML file directly — no server needed:

```bash
xdg-open visual.html      # macOS: open visual.html
```

---

## The two commands

### `crawl` — fetch a site and build the graph

```bash
sitemap-agent crawl <domain-or-url> [options]
```

The target may be a bare domain or a full URL. A bare domain is assumed to be
`https://`:

```bash
sitemap-agent crawl example.com                     # → https://example.com
sitemap-agent crawl https://example.com/docs/       # start deeper in the site
sitemap-agent crawl http://127.0.0.1:8787/          # http:// must be explicit
```

The start URL sets the scope. Crawling `https://example.com/docs/` still
reaches `https://example.com/pricing` if something links to it — the **host**
is the boundary, not the starting path.

### `render` — rebuild the visual from a saved graph

```bash
sitemap-agent render <sitemap.json> [--out path]
```

Purely offline: it reads the JSON and writes HTML, touching no network. Use it
to regenerate a visual after upgrading, or to produce one from a crawl someone
else ran and sent you.

```bash
sitemap-agent render sitemap.json --out site-map.html
```

Unlike `crawl --render`, this one honours the filename you give it.

---

## Options

All of these apply to `crawl`. Every value is a whole number unless noted.

| Option | Default | What it does |
|---|---|---|
| `--max-depth n` | unlimited | How many link-hops from the start page. `0` crawls only the start page; `1` adds everything it links to. |
| `--max-pages n` | unlimited | Hard cap on pages fetched. The crawl stops accepting new work once the cap is reserved. |
| `--concurrency n` | `5` | Pages fetched in parallel. |
| `--delay-ms n` | `200` | Minimum gap between request starts, across all workers. `0` is fine for a local fixture; leave it alone for someone else's server. |
| `--include-query` | off | Keep tracking parameters. See [below](#what-counts-as-one-page) — this is narrower than it sounds. |
| `--output path` | `./sitemap.json` | Where to write the graph. Parent directories are created. |
| `--render` | off | Also write a visual next to `--output`. **Always named `visual.html`** — the path's filename is ignored; only its directory is used. |
| `--resume path` | off | Continue from a checkpoint file. Read [Resuming](#resuming-an-interrupted-crawl) first — it has a sharp edge. |

`--help` prints the same list and exits `0`.

Two flags interact in a way worth spelling out:

```bash
sitemap-agent crawl example.com --output out/graph.json --render
# writes out/graph.json  and  out/visual.html   ← not out/graph.html
```

### Being a good guest

The defaults are deliberately gentle: 5 workers with a 200 ms minimum spacing,
which is roughly 5 requests/second. Before pointing this at a site you do not
own, set a page ceiling so a link loop or a huge archive cannot run away:

```bash
sitemap-agent crawl example.com --max-pages 500 --max-depth 4 --delay-ms 500
```

`robots.txt` is fetched and obeyed before anything else — see
[Scope](#what-gets-crawled).

---

## Configuration file

Drop a `.sitemaprc.json` in the directory you run from to set defaults for a
project. Keys are the flag names **without** the leading `--`:

```json
{
  "max-depth": 4,
  "max-pages": 500,
  "delay-ms": 500,
  "concurrency": 3,
  "output": "./artifacts/sitemap.json",
  "render": true
}
```

Precedence is **flag → config file → built-in default**, so the file sets the
policy and a flag overrides it for one run:

```bash
sitemap-agent crawl example.com --max-depth 1    # ignores the config's 4
```

Numbers may be written as JSON numbers (`4`) or as strings (`"4"`) — both work.
The file is read from the **current working directory**, not from the location
of the site or the binary. A missing or malformed file is ignored silently, so
if your settings seem to have no effect, check you are in the right directory
and that the JSON parses.

---

## What gets crawled

A URL is fetched only if all of these hold:

- **Same host as the start URL**, compared exactly. `www.example.com` and
  `example.com` are different hosts, and subdomains are out of scope. Whichever
  form you start with is the one that is followed.
- **`http:` or `https:`** — `mailto:`, `tel:`, and `javascript:` links are
  dropped.
- **Allowed by `robots.txt`**, fetched once from the start URL's origin. The
  crawler identifies as `sitemap-agent`, honouring a group addressed to that
  name and otherwise falling back to `User-agent: *`. The longest matching rule
  wins, `Allow` beating `Disallow` on a tie. An unreachable or unparseable
  `robots.txt` is treated as "allow everything".
- **Within `--max-depth` and `--max-pages`**, when set.

Links are read from `<a href>` in the returned HTML. Only responses with a
`text/html` content type are parsed for links, so a PDF or image that something
links to is recorded as a node — with its status and content type — but is
never followed. Non-HTML and failed pages still appear in the graph; that is
how you find broken links.

### What counts as one page

Before anything is fetched or stored, each URL is canonicalized so the same
page is not crawled twice:

- the fragment is dropped — `/docs#install` is `/docs`;
- a trailing slash is removed — `/docs/` is `/docs`;
- the default port is dropped, and host and scheme are lowercased;
- query parameters are sorted, so `?b=2&a=1` matches `?a=1&b=2`;
- the tracking parameters `utm_*`, `fbclid`, and `gclid` are stripped.

Note the last one carefully: **other query strings are kept** and do produce
separate nodes. `?page=2` is its own page, by default. `--include-query` only
stops the tracking parameters from being stripped, which splits
`/b/2?utm_source=newsletter` off from `/b/2` into a second node. It is for
auditing campaign URLs, not for turning query handling on.

---

## What you get back

### `sitemap.json`

Top level:

| Field | Meaning |
|---|---|
| `baseDomain` | Host the crawl was scoped to |
| `startUrl` | Canonical start URL — the root of the tree in the visual |
| `generatedAt` | ISO timestamp for the run |
| `crawlMeta` | `maxDepth`, `maxPages` (both `null` when unset), `durationMs`, `pageCount`, `errorCount` |
| `nodes` | Object keyed by canonical URL |

Each node:

```json
{
  "url": "http://127.0.0.1:8787/b/1",
  "path": "/b/1",
  "depth": 2,
  "status": 200,
  "contentType": "text/html;charset=utf-8",
  "title": "B / 1",
  "discoveredAt": "2026-08-31T01:40:25.690Z",
  "parents": ["http://127.0.0.1:8787/b", "http://127.0.0.1:8787/b/2"],
  "children": ["http://127.0.0.1:8787/b", "http://127.0.0.1:8787/b/2"],
  "error": null
}
```

`parents` and `children` are what make this a graph rather than a tree — a page
linked from three places lists all three. `depth` records the shortest path
found from the start URL. `status` is `null` and `error` is a message when the
request itself failed (DNS, timeout, connection refused) rather than returning
an HTTP status.

Keys are sorted on write, so re-crawling an unchanged site produces a
minimal diff — the file is worth committing if you want to track a site over
time. The shape is described in [`schema/sitemap.schema.json`](../schema/sitemap.schema.json).

Useful one-liners:

```bash
# Every page that errored or returned a non-2xx status
jq -r '.nodes[] | select(.error != null or .status >= 400) | "\(.status // "ERR") \(.url)"' sitemap.json

# Orphans: reachable pages nothing links to (other than the start URL)
jq -r '.nodes[] | select(.parents | length == 0) | .url' sitemap.json

# Deepest pages first
jq -r '.nodes[] | "\(.depth) \(.path)"' sitemap.json | sort -rn | head
```

### `visual.html`

One file, no assets, no network calls — the graph is inlined, so it works from
`file://`, over email, or from a USB stick. It gives you:

- a **path tree** rooted at the start URL, each node labelled by its last path
  segment;
- **click a node** to see its full metadata on the right, and to collapse or
  expand its children;
- a **filter box** — matching pages stay, and the ancestors needed to reach
  them stay faded for context;
- **red labels** for pages that errored or returned a non-2xx status;
- a **`+n parent` badge** on pages reachable from more than one place, since
  the tree can only draw each page under its first-discovered parent.

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Crawl finished and every page responded 2xx |
| `1` | Crawl finished but at least one page errored or returned a bad status — or the command failed outright |
| `64` | Usage error: unknown command, or a command with no target |

So `1` is not "the crawl failed" — the graph is still written. It means the
site has something broken in it, which is what makes this usable in CI:

```bash
sitemap-agent crawl example.com --max-pages 200 || echo "broken links found"
```

The run summary names the offending URLs:

```
Pages: 42
Max depth: 3
Errors: 1
Duration: 9210ms
Failed: https://example.com/old-page
```

---

## Resuming an interrupted crawl

`--resume <path>` reloads a checkpoint — the graph so far plus the pending
queue — and carries on.

**The current CLI cannot produce that file.** Checkpoint writing is a library
option (`checkpointPath`) that no flag is wired to, so `--resume` is only
usable against a checkpoint written by the programmatic API below. Pointing it
at a file that does not exist exits `1` with `ENOENT`. If you need resumable
crawls from the command line today, drive it with the API:

```ts
import { crawl } from "sitemap-agent/src/crawl";

await crawl("https://example.com", {
  checkpointPath: "./crawl.checkpoint.json",   // written after every page
  maxPages: 5000,
});
```

Then `--resume ./crawl.checkpoint.json` will pick it up. `*.checkpoint.json` is
already in `.gitignore`.

---

## Using it as a library

Everything the CLI does is exported:

```ts
import { crawl } from "./src/crawl";
import { writeSitemapJson, readSitemapJson, printRunSummary } from "./src/output";
import { renderVisualHtml } from "./src/visual";

const graph = await crawl("https://example.com", {
  maxDepth: 3,
  maxPages: 500,
  concurrency: 5,
  delayMs: 200,
  includeQuery: false,
  checkpointPath: "./crawl.checkpoint.json",
});

printRunSummary(graph);
await writeSitemapJson(graph, "./sitemap.json");
await Bun.write("./visual.html", renderVisualHtml(graph));

// Later, with no network:
const saved = await readSitemapJson("./sitemap.json");
await Bun.write("./visual.html", renderVisualHtml(saved));
```

`readSitemapJson` validates as it parses and throws on a malformed graph, so
you can trust the shape of what comes back. Lower-level pieces —
`canonicalize`, `isSameScope`, `fetchRobotsRules`, `isAllowedByRobots` from
`src/url`, and `fetchPage`, `extractLinks`, `extractPageMeta` from `src/fetch`
— are exported too if you want the scoping rules without the crawl loop.

---

## Troubleshooting

**`bun run typecheck` reports errors that make no sense** — `TS2688: Cannot
find type definition file for 'bun-types'`, or `TS2550: Property 'entries'
does not exist on type 'ObjectConstructor'`. The install landed as symlinks
your filesystem cannot resolve; which package it hits varies, so the error
moves around. Reinstall with real files:

```bash
rm -rf node_modules && bun install --backend=copyfile
```

**The crawl found one page and stopped.** Either the start page has no
same-host `<a href>` links (a JavaScript-rendered site will look like this — it
is a documented non-goal), or `robots.txt` disallows the rest. Check what the
crawler sees:

```bash
curl -sA sitemap-agent https://example.com/robots.txt
curl -sA sitemap-agent https://example.com/ | grep -o 'href="[^"]*"' | head
```

**Pages are missing that you know exist.** They are probably only reachable
from a page beyond `--max-depth`, or they are on `www.` while you crawled the
bare domain (or the reverse). Nothing discovers a page that is never linked.

**`Errors: 0` but the exit code is `1`.** That combination cannot come from the
crawl — the command itself failed. Read the message above the summary.

**My `.sitemaprc.json` is ignored.** It is read from the current working
directory. A file that fails to parse is skipped without a warning, so run it
through `jq .` to check.
