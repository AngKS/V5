# V5 — Kah Shin’s portfolio

A comic-inspired personal portfolio showcasing my projects, interests, and work. Built with Next.js, TypeScript, Motion, and Vercel.

**[Visit the live portfolio](https://thatasiandude.com)** · [Report an issue](https://github.com/AngKS/V5/issues)

## Screenshots

Bold typography, cobalt accents, panda artwork, and an organic portrait frame.

![Desktop portfolio hero](docs/screenshots/desktop.webp)

The screenshot captures the local application; explore the live site for the full experience.

## Features

- Responsive introduction, LinkedIn experience link, project carousel, writing section, and contact links.
- GitHub projects ranked by stars, then latest default-branch commit; lazy loading, pagination, touch swipes, and horizontal trackpad navigation.
- Medium RSS integration, with a coming-soon state until a profile is configured.
- Animated panda introduction and illustrated interests.
- Comic loading animation, custom “Object not detected” 404, and an engine-room link to this repository.
- Reduced-motion support, keyboard controls, and SVG icons.

## Stack

Next.js App Router · React · TypeScript · Motion for React · Vercel AI SDK · OpenAI · Vercel Blob

## Run locally

Use Node.js 20.9 or newer.

```sh
git clone https://github.com/AngKS/V5.git
cd V5
npm ci
cp .env.example .env.local
npm run dev
```

Open [localhost:3005](http://localhost:3005). The portfolio works without an OpenAI key.

```sh
npm run typecheck
npm test
npm run build
```

## Make it your own

Replace the personal content and artwork before publishing your own portfolio.

| Location                    | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `src/content/profile.ts`    | Contact details, social links, and verified experience  |
| `src/lib/files.ts`          | Resume fallback and public file handling                |
| `src/components/header.tsx` | Navigation and mobile resume shortcut                   |
| `public/`                   | Portraits, comic illustrations, and other visual assets |
| `src/app/globals.css`       | Base colors, typography, and responsive layout          |

Experience links to LinkedIn until verified entries are supplied. No automatic LinkedIn employment-history sync is implemented.

### Environment variables

All credentials stay server-side. Never prefix secret keys with `NEXT_PUBLIC_` or commit `.env.local`.

| Variable                | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `GITHUB_TOKEN`          | Optional higher rate limit for GitHub metadata                                |
| `MEDIUM_PROFILE_URL`    | Optional Medium profile for article previews                                  |
| `OPENAI_API_KEY`        | Enables optional AI responses                                                 |
| `OPENAI_MODEL`          | Selects the OpenAI model; review provider availability and pricing before use |
| `BLOB_READ_WRITE_TOKEN` | Owner-only script credential for uploading public portfolio files             |
| `PORTFOLIO_BLOB_URL`    | Public Blob store origin                                                      |

See [`.env.example`](.env.example) for the configured defaults. GitHub metadata and Medium feeds are cached for one hour. Unavailable commit dates fall back to repository push dates and are labeled in the interface.

Performance behavior, measured transfer sizes, and the `npm run media:optimize`
workflow are documented in [docs/performance.md](docs/performance.md).

## Portfolio files

Connect a **public** Vercel Blob store for visitor-facing files. There is no public upload endpoint.

```sh
npm run files:upload -- /absolute/path/resume.pdf
# Deliberately replace previously published files:
npm run files:upload -- /absolute/path/resume.pdf --overwrite
```

The script uploads `portfolio/resume.pdf`, `portfolio/USER_MANUAL.md`, and `portfolio/hello.txt`. Without a PDF argument, it uploads only the text files. Set `PORTFOLIO_BLOB_URL` to the printed store origin and restart or redeploy.

The `/files/resume.pdf` route falls back to the Google Drive resume when the Blob PDF is unavailable. The mobile menu links directly to Google Drive. Text files have bundled fallbacks. Uploaded files do not automatically become AI knowledge.

## Deployment

The repository’s `main` branch is connected to the Vercel project `kahshin-portfolio-v5`; pushes trigger production deployments. For your own fork, import it into Vercel, select the Next.js preset, and configure environment variables in your own project. No custom `vercel.json` is required.

## AI agent access

The homepage registers six read-only tools when the experimental
`document.modelContext` WebMCP API is available:

- `get_portfolio_profile`: owner-supplied biography and interests.
- `get_portfolio_experience`: career entries, LinkedIn source and review date.
- `get_portfolio_education`: study programmes, dates and activities; future completion is explicitly marked.
- `get_portfolio_contact`: public contact, resume, and source links.
- `get_portfolio_writing`: public article metadata or availability status.
- `list_portfolio_projects`: paginated public GitHub repositories (`page`, zero-based).

No tools call OpenAI, send messages, navigate the page, mutate data, or access
visitor storage. External repository/feed content is marked untrusted. Tools
register only on the homepage, clean up via AbortSignal, and are a no-op in
unsupported browsers. Native availability depends on browser support and policy.

For agents without WebMCP, `/llms.txt` links to `/api/agent`, its public JSON
resources, and the existing project API. These are HTTP resources, not a remote
MCP server. `src/content/agent-info.ts` holds the public facts; it never exports
internal implementation instructions. LinkedIn career and education are a manually reviewed snapshot (2026-11-03), not an automatic sync. Missing details and resume text are explicitly
marked as unavailable. Optional feeds retain the site's one-hour cache behavior.

## Contributing

Issues and pull requests are welcome. For changes, run `npm run typecheck`, `npm test`, and `npm run build`. Check responsive layouts, keyboard navigation, and reduced-motion behavior when changing interactive features. Keep credentials and private information out of contributions.

## License and credits

The source code is available under the [MIT License](LICENSE). You may use, modify, and redistribute it under those terms.

Personal photos, portraits, panda artwork, generated comic illustrations, logos, resume content, and screenshots are **not included in the MIT license**. They are shown here to document this portfolio; replace them with assets you have permission to use. See [NOTICE.md](NOTICE.md).

Visual inspiration: [Local Studio](https://localstudio.fr/about). The original panda outline was carried forward from Kah Shin’s earlier portfolio. Comic illustrations were generated from supplied photographs.
