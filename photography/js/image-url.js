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
*/
function cfImage(path, width) {
  var abs = new URL(path, document.baseURI).pathname; // e.g. /photography/photos/first-roll/foo.jpg
  return '/cdn-cgi/image/width=' + width + ',fit=scale-down,format=auto/' + abs.replace(/^\//, '');
}
