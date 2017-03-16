/* Exports a single function, which installs a basic auth check if that's how
 * we're configured. Uses a constant-time buffer comparison */
import bufferEq from 'buffer-equal-constant-time';
import httpAuth from 'http-auth';

export default function (envCreds) {
  if (envCreds && envCreds.UI_BASIC_AUTH
      && Object.keys(envCreds.UI_BASIC_AUTH).length > 0) {
    const authCreds = envCreds.UI_BASIC_AUTH;
    const auther = httpAuth.basic({}, (username, password, callback) => {
      const hasMatch = Object.keys(authCreds).some(key =>
          bufferEq(new Buffer(key), new Buffer(username))
          && bufferEq(new Buffer(authCreds[key]), new Buffer(password)));
      callback(hasMatch);
    });
    return httpAuth.connect(auther);
  }
  return null;
}
