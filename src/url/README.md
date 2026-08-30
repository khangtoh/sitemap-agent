# URL and crawl-scope rules

`resolveUrl` uses the platform `URL` constructor to resolve relative and absolute HTTP(S) links. Empty, malformed, `mailto:`, `tel:`, `javascript:`, and non-HTTP(S) links are ignored.

`canonicalize` lowercases scheme and hostname, removes fragments, default HTTP/HTTPS ports, and a non-root trailing slash. It drops `utm_*`, `fbclid`, and `gclid` by default and sorts remaining parameters by name/value. Pass `ignoreQueryParams: []` to preserve all query parameters. The resulting canonical URL is the `dedupeKey` exactly.

`isSameScope` accepts only the supplied base host by default. `includeSubdomains: true` also accepts its child hosts. `fetchRobotsRules` reads `/robots.txt`, selecting the exact user-agent group before `*`; fetch failures allow all URLs. `Allow` and `Disallow` use prefix matching, where the longest rule wins and `Allow` wins a same-length tie.
