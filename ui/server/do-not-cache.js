/* Middleware that asks down-stream caches (notably CloudFront) to _not_ keep
 * anything. */
function doNotCache(req, res, next) {
  res.append('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
  res.append('Expires', '0');
  res.append('Pragma', 'no-cache');
  next();
}

module.exports = doNotCache;
