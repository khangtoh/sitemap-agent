# Install and run sitemap-agent

`sitemap-agent` crawls links on one website and writes a JSON graph of the
pages it finds. With `--render`, it also creates `visual.html`, an interactive
map that opens locally in any browser.

It is not an SEO `sitemap.xml` generator and it does not execute JavaScript.

## Prerequisite

Install [Bun](https://bun.sh/) 1.4 or later. The project is not published to
npm, so install it from a Git clone.

## Install from a clone

```bash
git clone https://github.com/khangtoh/sitemap-agent.git
cd sitemap-agent
bun install
```

Confirm the command is available from the checkout:

```bash
bun run bin/sitemap-agent.ts --help
```

To make `sitemap-agent` available from any directory, run this once while in
the clone:

```bash
bun link
sitemap-agent --help
```

`bun link` uses the checkout directly; pulling updates changes the global
command. Run `bun unlink` from the checkout to remove the link.

## Crawl a site

Use a bare domain or a complete URL. Bare domains default to HTTPS.

```bash
# From the clone
bun run bin/sitemap-agent.ts crawl example.com \
  --max-depth 3 --max-pages 500 --render

# Or, after bun link
sitemap-agent crawl https://example.com \
  --max-depth 3 --max-pages 500 --render
```

The command writes these files to the current directory by default:

- `sitemap.json` — the crawled page/link graph.
- `visual.html` — an offline interactive view, when `--render` is supplied.

Open `visual.html` directly in a browser; it has no server or network
dependency.

Choose an output directory with `--output`:

```bash
sitemap-agent crawl example.com --output artifacts/site.json --render
# writes artifacts/site.json and artifacts/visual.html
```

For sites you do not own, set a conservative page limit and delay:

```bash
sitemap-agent crawl example.com \
  --max-pages 500 --max-depth 4 --delay-ms 500
```

The crawler stays on the starting host, respects `robots.txt`, ignores
non-HTTP links, and removes fragments and common tracking parameters when it
deduplicates pages.

## Render an existing graph

No crawling is needed to regenerate a visual from saved JSON:

```bash
sitemap-agent render sitemap.json --out site-map.html
```

## Common options

```text
--max-depth n     Maximum link hops from the start page
--max-pages n     Maximum pages to fetch
--concurrency n   Parallel fetches (default: 5)
--delay-ms n      Minimum delay between requests (default: 200)
--output path     JSON output path (default: ./sitemap.json)
--render          Create visual.html beside the JSON output
--resume path     Continue from a checkpoint
```

Run `sitemap-agent --help` for the complete command reference. For
configuration, output format, troubleshooting, and detailed crawl behavior,
see [the full usage guide](USAGE.md).
