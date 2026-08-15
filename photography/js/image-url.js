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
