# V5 — Kah Shin's portfolio

Comic-inspired refresh of https://www.thatasiandude.com, with visual direction
inspired by https://localstudio.fr/about.

## Selected stack

- Next.js App Router and TypeScript.
- Vercel hosting, with GitHub-based preview and production deployments.
- Motion for React (`motion`, imported from `motion/react`) for animation.
- Respect reduced-motion preferences; keep content readable without animation.

The base application is implemented locally. Deployment and the existing domain
migration are still pending.

## Design direction

Oversized condensed headlines, black-and-white comic panels, halftone texture,
serif body text, and expressive spacing. Create original personal artwork and
layouts inspired by the reference. Use restrained panel reveals, speech-bubble
entrances, and interactive hover effects.

## Sections and content sources

- **About Me:** short introduction and a playful chapter-based experience timeline.
  LinkedIn: https://www.linkedin.com/in/kahshinang (confirmed).
  Initial experience content awaits the user's export or supplied text.
  Standard LinkedIn sign-in access does not provide full employment history;
  automatic position syncing requires a supported, approved integration.
- **Portfolio:** curated current projects from https://github.com/AngKS.
  Fetch metadata server-side and cache it; rank public, non-fork, non-archived repositories by stars, then latest
  default-branch commit.
- **Writing:** Medium article previews linking to the original articles, populated
  through a server-side RSS fetch once the user supplies their Medium profile.
  The Medium account is still being set up.
- **Contact Me:** email and LinkedIn links.
- **Social links and resume:** email, GitHub, LinkedIn, and a Google Drive resume link.
  Confirm the current resume and email before launch.

## Release approach

Build and verify a Vercel preview first. Verify the intended Vercel project,
production build, and domain configuration before moving the existing domain.
No hosting migration has been performed yet.

## Local development

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Use `npm run build` for a production build and `npm run typecheck` for TypeScript.

## Content configuration

Edit `src/content/profile.ts` for contact details and
verified experience entries. Email and resume links were carried forward from the
existing site and should be confirmed before production launch. The introduction
is based on the owner's supplied interests; the illustrations are original
conceptual artwork, not screenshots of the featured projects.

Copy `.env.example` to `.env.local` when configuring Medium or an optional GitHub
token. Tokens remain server-side. GitHub metadata and Medium RSS are cached for
one hour; the carousel offers a retry if the repository catalog cannot be fetched.
Medium cards link to original stories without injecting feed HTML. With no
Medium profile configured, the page shows a coming-soon message. Experience
links to LinkedIn until verified entries are supplied.

## Vercel

Import the AngKS/V5 repository into the intended Vercel account, select the
Next.js preset, and configure the optional environment variables there. Use
`npm run build` and the default Next.js output settings. Review a preview before
connecting the production domain. No custom `vercel.json` is required.

## Deferred

Easter eggs are intentionally out of scope for this base application.

## Panda introduction

The original seven-path panda artwork was recovered from the deployed old site's
`OverlayLogo.jsx` source map; its geometry is preserved in `src/content/panda.ts`.
`PandaIntro` draws it with Motion in a responsive, cobalt welcome screen, then
fades out after 2.4 seconds. Skip or Escape dismisses it early. It runs once per
tab session, bypasses deep links and reduced-motion preferences, and cleans up
its timer and listeners. Page content is inert only while the intro is active;
no body scrolling styles are changed. Clearing `v5:panda-intro-seen` in session
storage lets developers replay it during QA. Easter eggs remain deferred.

## Project carousel

`/api/projects?page=0&pageSize=3` returns a page of globally ranked public
repositories (three per desktop page, one on mobile). Forks, archived repositories,
and empty repositories are excluded. Stars sort descending, followed by the latest
default-branch commit's committer date, then repository name for stable ties.
The catalog and individual GitHub responses are cached for one hour. Commit
lookups run at most four at a time. Unavailable commit dates fall back to the
repository push timestamp and are labelled in the UI. Configure a server-only
`GITHUB_TOKEN` for a higher GitHub rate limit.

The browser requests nothing until the carousel approaches the viewport, fetches
subsequent pages on demand, and retains visited pages locally for the mounted
carousel. Previous/Next buttons, keyboard arrows on the carousel region, horizontal
trackpad gestures, and mobile touch swipes navigate. Trackpad momentum advances
only one page per gesture; vertical scrolling and pinch zoom are left alone.
Cards remain visible during lazy loading, then transition in the navigation
direction. Motion transitions honor reduced motion.

## Hidden auxiliary terminal

Keep scrolling at the very bottom of the footer to uncover the console. It takes 720 accumulated pixels of deliberate overscroll (individual wheel impulses are capped); partial pulls reset after 1.8 seconds. Mobile visitors can keep swiping upward. The subtle “END OF TRANSMISSION” button provides an equivalent keyboard/tap entrance. Escape, the close button or `exit` seals it. Reduced-motion users receive the boot text immediately.

Commands: `ls`, `help`, `man`, `cat hello.txt`, `cat USER_MANUAL.md`, `cat resume.pdf`, `qn <question>`, `clear`, `exit`. The filesystem is virtual; the PDF command links to the configured Google Drive resume. No shell commands run. Command history lives only in the mounted terminal and clears on close.

For Q&A, set `OPENAI_API_KEY` in `.env.local` and in Vercel's server environment, then restart/redeploy. Never use a `NEXT_PUBLIC_` key. `OPENAI_MODEL` defaults to `gpt-5-nano`, the cheapest available general text model checked on November 3, 2026 ($0.05 input / $0.40 output per million tokens). **It is deprecated and retires December 11, 2026**; select a supported model via `OPENAI_MODEL` before then. See [OpenAI pricing](https://developers.openai.com/api/docs/models/gpt-5-nano) and [deprecations](https://developers.openai.com/api/docs/deprecations). No silent fallback to a more expensive model is configured.

The Vercel AI SDK streams answers using only the public facts in `src/content/terminal-knowledge.ts` and `src/content/profile.ts`. Add verified background details there. Questions are independent: no chat history is sent, no tools are enabled, and provider response storage is disabled (`store: false`; this does not change OpenAI's other data retention policies). Questions are capped at 600 characters, generation at 1,200 output tokens (including reasoning), with no automatic retries and a 25-second timeout. Local commands work without a key.

The API rejects cross-origin browser requests and oversized bodies, and includes a 20-request/minute **per-instance** circuit breaker. This is not a durable, distributed spending cap: configure provider project budgets and a Vercel Firewall rate limit for `/api/terminal` before exposing a paid key to substantial public traffic. No questions or upstream errors are logged by this application. Missing keys and provider failures show friendly terminal messages.

## Portfolio files in Vercel Blob

Use a **public** Blob store connected to this Vercel project. These are visitor-facing documents. Set `BLOB_READ_WRITE_TOKEN` in `.env.local` for the owner upload script; it is never sent to the browser, and the site has no public upload endpoint.

```sh
npm run files:upload -- /absolute/path/resume.pdf
# Later, deliberately replace the published files:
npm run files:upload -- /absolute/path/resume.pdf --overwrite
```

This uploads `portfolio/resume.pdf`, `portfolio/USER_MANUAL.md`, and `portfolio/hello.txt`. Without a PDF argument, only the two text files upload. Text files are generated from the built-in terminal content. Set `PORTFOLIO_BLOB_URL` to the printed store origin in `.env.local` and Vercel, then restart/redeploy. Replacements may take up to five minutes to appear due to caching.

All resume links now use `/files/resume.pdf`. Until Blob is configured, that route redirects to the existing Google Drive resume. Once configured and the PDF exists, it redirects directly to Blob to avoid proxying the PDF through a Function. The terminal reads text files through `/files/USER_MANUAL.md` and `/files/hello.txt`, with built-in fallbacks during storage outages. Only these three filenames are exposed. The boot sequence and `help` remain bundled so discovery works without a network request. Uploaded files are not automatically added to AI knowledge; verified Q&A facts remain curated separately.

### Discovered visual mode

Closing the terminal (including clicking/tapping its backdrop) unlocks a cyberpunk overlay for the current tab: neon damaged header lettering, circuit traces, and Matrix-style rain behind each section. “BREACH ACTIVE / RESTORE” returns to the original design and disappears. Reopen and leave the terminal to activate breach mode again. The choice lasts for the tab session. The section canvases load only after discovery, run at roughly 12 fps, and pause when their section is offscreen or the tab is hidden. Reduced-motion mode disables rain and letter fizz. Effects are visual only; no audio plays.

Vercel project: `akss-projects/kahshin-portfolio-v5`, connected to `AngKS/V5`. Public Blob store: `kahshin-portfolio-files` in Singapore (`sin1`). The manual and hello file are uploaded; resume upload is pending. Upload it as `portfolio/resume.pdf`, or run the upload script with `--overwrite` to update all three files. The existing Google Drive link remains the fallback until the PDF exists.

### Smaller discoveries

The custom 404 says “Object not detected” with a searching bounding box. The comic worker appears in the route loading fallback and project loading states. The footer's “engine room” link opens this repository. Its discovery passport collects four stamps (terminal, breach, source, 404) under `v5:discovery-stamps:v1` in localStorage, validates stored IDs, and synchronizes updates across tabs. Storage-blocked browsers keep stamps only in memory. No stamp data is sent to the server. Animations respect reduced motion. The intro panda now draws in black.
