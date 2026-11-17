# ParsePlayground

A legal, purpose-built environment for practising web scraping, browser automation (Playwright, Selenium, Puppeteer), HTTP clients and data extraction. Live at **https://parseplayground.com**.

No database: all content is generated at build time from a fixed seed, so every deploy serves identical data and scraping exercises have stable answers.

## Quick start

```bash
npm install
npm run dev          # generates data, then starts http://localhost:3000
npm run build        # generates data, then builds for production
```

Node 24+ is required (the data generator is TypeScript run natively by Node).

## Test accounts

Every password is `password123`.

| Username | Behaviour |
|---|---|
| `standard_user` | Normal login |
| `locked_user` | Rejected with an "account locked" message (HTTP 423 for JSON) |
| `premium_user` | Extra premium dashboard content |
| `admin_user` | Access to `/admin` |
| `slow_user` | Login response delayed by 5 seconds |

## Project layout

```
app/                 Next.js App Router pages and API route handlers
  api/               Public data API, auth, health, stats, rate-limit demos
config/users.json    Test accounts (bcrypt hashes)
lib/                 Auth (JWT via jose), CSRF, API helpers, in-memory stats
proxy.ts             Route protection + CSRF token for /login (Next.js 16 proxy)
scripts/             Build-time data generator
data/generated/      Generated JSON (git-ignored, recreated on every build)
public/exports/      Generated JSON/CSV/XML/HTML downloads (git-ignored)
.github/workflows/   Uptime check (writes to the `status` branch)
netlify.toml         Netlify build settings
```

## Deploying to Netlify

1. In Netlify, **Add new project → Import from Git** and pick this repository. Build settings are read from `netlify.toml`.
2. Under **Site configuration → Environment variables**, set:
   - `JWT_SECRET` and `CSRF_SECRET`: long random strings (`openssl rand -base64 48`)
   - `SITE_URL`: `https://parseplayground.com`
3. Under **Build & deploy → Branches and deploy contexts**, keep branch deploys set to **production branch only**.
4. Under **Domain management**, add `parseplayground.com` and follow the DNS instructions. Netlify issues the HTTPS certificate automatically.

### Uptime check

`.github/workflows/uptime.yml` pings `/api/health` every 5 minutes and appends the result to `status.json` on the `status` branch (free on public repositories). The `ignore` rule in `netlify.toml` ensures those commits never trigger a Netlify build. To check a different URL, set a repository variable named `SITE_URL`.

## Portability

The app uses only standard Next.js and Web APIs. Security headers, robots.txt and the sitemap are defined in Next.js itself, not in host-specific files, so it also runs on Vercel, Azure Static Web Apps or any Node host with `next start`.

## Licence

GPL-3.0. See [LICENSE](LICENSE).
