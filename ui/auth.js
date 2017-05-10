/* Exports a single function which installs passport-based authentication
 * depending on configuration. Uses a constant-time buffer comparison */
import bufferEq from 'buffer-equal-constant-time';
import passport from 'passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { BasicStrategy } from 'passport-http';

const noopStrategy = new CustomStrategy((req, callback) => {
  callback(null, true);
});

function basicAuth(authCreds) {
  return new BasicStrategy((username, password, done) => {
    const hasMatch = Object.keys(authCreds).some(key =>
      bufferEq(new Buffer(key), new Buffer(username))
      && bufferEq(new Buffer(authCreds[key]), new Buffer(password)));
    done(null, hasMatch);
  });
}

export default function (envCreds) {
  if (envCreds && envCreds.UI_BASIC_AUTH
      && Object.keys(envCreds.UI_BASIC_AUTH).length > 0) {
    passport.use('basic', basicAuth(envCreds.UI_BASIC_AUTH));
  } else {
    passport.use('basic', noopStrategy);
  }
}

