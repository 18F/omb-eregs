const cfenv = require('cfenv');

const creds = cfenv.getAppEnv().getServiceCreds('config');

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME],
  /**
   * Your New Relic license key.
   */
  license_key: creds.NEW_RELIC_LICENSE_KEY,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info',
  },
  agent_enabled: !!(process.env.NEW_RELIC_APP_NAME && creds.NEW_RELIC_LICENSE_KEY),
  error_collector: {
    enabled: true, // default
    ignore_status_codes: [401, 404],  // added 401 to the default: [404]
    capture_events: true, // default
    max_event_samples_stored: 100, // default
  },
};
