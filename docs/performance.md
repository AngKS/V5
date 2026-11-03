# Loading and animation performance

The landing page stays statically generated, with hourly revalidation. The
walking gallery, terminal, breach transition, and their styles load on demand.
The original fonts are self-hosted through `next/font/local`, which preloads the
four Latin WOFF2 files and supplies metric-adjusted fallback fonts.

The page-curl thumbnail is a 160-pixel image rather than the full comic artwork.
The PNG comic backdrop and transparent walking poster have WebP delivery copies.
Original assets are retained for future editing.

## Walking media

Run `npm run media:optimize` from the repository root with FFmpeg installed to
regenerate the delivery images and both walking videos. The source is
`public/video/kah-shin-walking-matted.mp4`, produced by the existing matte script.

- Desktop: 2560 × 720, CRF 22, approximately 2.7 MB.
- Mobile: 1920 × 540, CRF 23, approximately 1.5 MB.
- Both retain synchronized colour and alpha halves, 30 fps, fast-start metadata,
  no B-frames, and a keyframe every four frames for bounded seek decoding.
- The viewport is resolved before setting the video source, so mobile does not
  first download the desktop file.
- The WebGL canvas matches the decoded half-frame size and reuses its texture.
  It draws only after loaded/seeked frames, with seeks quantized to frame times.
- Reduced-motion and GPU/video failures keep the transparent still and static
  interest cards. Reduced-motion skips the video request entirely.

## Runtime work

The interests marquee pauses offscreen and when the document is hidden. The
project loading animation is mounted only as its section approaches view. The
terminal's non-passive wheel/touchmove listeners exist only while its footer
hatch is visible; normal page scrolling does not run them. Optional WebMCP code
loads only in browsers exposing the API.

The first three projects are supplied at prerender time when GitHub is available,
and seed both desktop and mobile carousel caches. If this lookup fails, the
existing client API path loads projects near the viewport. Pagination remains
cached in the component and the server ranking cache remains hourly.

## Local verification — 4 November 2026

Production build, Chromium in-app browser, desktop viewport 1280 × 720, browser
cache disabled, local server warm. `#home` skips the intentional intro. Transfer
sizes include response headers; these are not field Web Vitals or a real-device
mobile benchmark.

| Measurement                         |                     Before |                      After |
| ----------------------------------- | -------------------------: | -------------------------: |
| Initial page transfer               |              910,996 bytes |   556,628 bytes (39% less) |
| Additional desktop gallery transfer |           13,207,642 bytes | 4,542,149 bytes (66% less) |
| Desktop walking video               |            8,391,442 bytes |            2,698,411 bytes |
| Mobile walking video                | Same 8,391,442-byte source | 1,455,897 bytes (83% less) |

The desktop video has SSIM 0.998416 against the matte source across all 239
frames. This includes the empty background, so visual inspection of the
character edges and shoes was also performed. At the home section after loading,
a 7.5-second idle sample showed no additional layouts, style recalculations, or
script execution.

Verified in the production browser: desktop forward/reverse walking, transparent
edges, name finale, scroll release, return flap and focus restoration; 390 × 844
mobile source selection and one poster at a time at roughly 60% width; project
pagination and viewport changes; career disclosures; mobile menu; reduced-motion
static fallback without a video request; footer overscroll terminal opening,
`ls`, breach and restore, and restoration of normal page scrolling. Browser
errors/warnings were empty during those flows.

GitHub returned 403 during prerender in this local run. The page built with its
fallback, and the cached projects API returned 49 projects with working desktop
and mobile pagination. The successful server-data path was separately verified
on the development server with its existing GitHub cache: three cards arrived
in the HTML, mobile immediately showed one, and neither initial layout needed
an additional projects API request. AI provider calls were not sent. Physical iOS/Android performance
and deployed CDN behavior remain outside this local check.

Validation: `npm run typecheck`, all 12 existing tests, and `npm run build`.
