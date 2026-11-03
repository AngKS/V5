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
