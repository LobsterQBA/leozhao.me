# Website analytics

The site uses anonymous, cookieless Vercel Web Analytics. Because the portfolio
combines three Vercel projects, its data is split by serving project:

Useful page filters:

- `leo-zhao`: `/` and `/projects/where-to-sit*`
- `splittaste`: `/projects/splittaste*`
- `trackpad-canvas`: `/projects/trackpad-canvas*`

The `leo-zhao` deployment build injects the project-specific resilient intake
script into every static HTML page. The two rewritten Next.js projects use the
official `@vercel/analytics` package and send to their own Vercel project.

Use **Visitors** for approximate unique daily visitors and **Page Views** for
total page loads. Vercel resets its anonymous visitor hash each day, so a
visitor returning on another day is counted again.
