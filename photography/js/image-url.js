/*
  CLOUDFLARE IMAGE RESIZING HELPER
  --------------------------------
  Wraps a photo path so it's requested through Cloudflare's Image Resizing
  service instead of the original file directly. Cloudflare fetches the
  original from this site, resizes it, and serves it as WebP/AVIF/JPEG
  depending on what the visitor's browser supports (format=auto) — cached
  at the edge after the first request. The original files in photos/ are
  untouched; nothing is uploaded anywhere.

  Requires "Image Resizing" to be turned on for the zone in the Cloudflare
  dashboard (Speed > Optimization). If it's off, /cdn-cgi/image/ requests
  404 — do not deploy this until it's confirmed on.

  width  -> target width in pixels. fit=scale-down means it will never
            upscale a smaller original past its real size.

  LOCAL PREVIEW: /cdn-cgi/image/ only exists on the live faisalhenar.com
  zone; it 404s anywhere else, including a local dev server or a page
  opened directly from disk. isLocalDev() below detects that case (by
  protocol or hostname, never by anything Cloudflare-side) and serves the
  original file unresized instead, so photos still show up while
  previewing. This never runs against the real domain: production keeps
  requesting through Cloudflare exactly as before.
*/
function isLocalDev() {
  var loc = window.location;
  return loc.protocol === 'file:' ||
    loc.hostname === 'localhost' ||
    loc.hostname === '127.0.0.1' ||
    loc.hostname === '';
}

function cfImage(path, width) {
  var resolved = new URL(path, document.baseURI);
  if (isLocalDev()) {
    return resolved.href;
  }
  var abs = resolved.pathname; // e.g. /photography/photos/first-roll/foo.jpg
  return '/cdn-cgi/image/width=' + width + ',fit=scale-down,format=auto/' + abs.replace(/^\//, '');
}

/*
  CANDIDATE WIDTHS
  ----------------
  The ladder the browser chooses from. Each page tells it, through the
  img's `sizes`, how wide the photograph will actually be drawn; the
  browser then picks the smallest candidate that covers that at the
  screen's own pixel density. Before this existed every photograph was
  fetched at one fixed width whatever the slot: the Index asked for
  1200px for a picture drawn at 286.

  The steps are roughly 1.25x apart, which is close enough that the
  browser rarely overshoots by much and far enough apart that the edge
  cache is not fragmented into dozens of near-identical variants.
*/
var CF_WIDTHS = [320, 420, 560, 700, 860, 1040, 1280, 1600, 2000];

/*
  maxCssWidth   -> the widest this photograph is ever drawn, in CSS px,
                   across every breakpoint of the slot it sits in.
  intrinsicWidth-> the original file's real width.

  The list stops at about 2.2x the widest drawn size (enough for a 2x
  screen with a little room) and never passes the original's own width:
  Cloudflare's scale-down does not upscale, so a candidate above that is
  the same file again under a larger label, and the browser would choose
  it over a smaller one for nothing.
*/
function cfSrcset(path, maxCssWidth, intrinsicWidth) {
  // Local preview serves the original file at every width, so a srcset
  // would be a list of identical URLs with lying descriptors. Return
  // nothing and let the src carry the photograph.
  if (isLocalDev()) return '';

  var ceiling = Math.ceil(maxCssWidth * 2.2);
  if (intrinsicWidth) ceiling = Math.min(ceiling, intrinsicWidth);

  var out = [];
  var i;
  for (i = 0; i < CF_WIDTHS.length; i += 1) {
    if (CF_WIDTHS[i] > ceiling) break;
    out.push(cfImage(path, CF_WIDTHS[i]) + ' ' + CF_WIDTHS[i] + 'w');
  }
  // Top the list up to the ceiling itself when the ladder stopped short
  // of it, so a wide slot on a dense screen is not capped below what it
  // needs. This is also the only candidate a very small original gets.
  var last = i > 0 ? CF_WIDTHS[i - 1] : 0;
  if (last < ceiling) out.push(cfImage(path, ceiling) + ' ' + ceiling + 'w');

  return out.join(', ');
}
