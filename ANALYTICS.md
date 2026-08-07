# Website analytics

The site uses Vercel Web Analytics from the `leo-zhao` Vercel project. The
tracker is anonymous and cookieless. The deployment build injects the shared
script into every HTML page so the portfolio and its static subprojects report
to one dashboard.

Useful page filters:

- `/` — portfolio home
- `/projects/where-to-sit*` — Where to Sit
- `/projects/splittaste*` — SplitTaste
- `/projects/trackpad-canvas*` — Trackpad Canvas

Use **Visitors** for approximate unique daily visitors and **Page Views** for
total page loads. Vercel resets its anonymous visitor hash each day, so a
visitor returning on another day is counted again.
