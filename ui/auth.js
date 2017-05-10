/* Exports a single function which installs passport-based authentication
 * depending on configuration. If an IP whitelist is configured, requests
 * which originate from a whitelisted IPs (or ranges), it is granted access.
 * If not on the whitelist and basic auth is configured, use a constant-time
 * buffer comparison to check access. If basic auth is not configured, default
 * to a noop strategy, which allows all access.
 *
 * Warning: do not enable UI_IP_WHITELIST unless you are behind a proxy -- we
 * are only checking the x-forwarded-for header, which is easy to spoof if you
 * are not. */
import bufferEq from 'buffer-equal-constant-time';
import passport from 'passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { BasicStrategy } from 'passport-http';
import rangeCheck from 'range_check';

const noopStrategy = new CustomStrategy((req, callback) => {
  callback(null, true);
});

export function basicAuth(authCreds) {
  return new BasicStrategy((username, password, done) => {
    const hasMatch = Object.keys(authCreds).some(key =>
      bufferEq(new Buffer(key), new Buffer(username))
      && bufferEq(new Buffer(authCreds[key]), new Buffer(password)));
    done(null, hasMatch);
  });
}

export function forwardedIPAuth(whitelist) {
  const ranges = whitelist.filter(rangeCheck.isRange);
  const ips = whitelist.filter(ip => !rangeCheck.isRange(ip));
  return new CustomStrategy((req, callback) => {
    const ip = req.get('x-forwarded-for');
    callback(null, rangeCheck.inRange(ip, ranges) || ips.includes(ip));
  });
}

export default function ({ UI_BASIC_AUTH, UI_IP_WHITELIST }) {
  const whitelist = UI_IP_WHITELIST || [];
  passport.use('ip', forwardedIPAuth(whitelist));

  if (UI_BASIC_AUTH && Object.keys(UI_BASIC_AUTH).length > 0) {
    passport.use('basic', basicAuth(UI_BASIC_AUTH));
  } else {
    passport.use('basic', noopStrategy);
  }
}

