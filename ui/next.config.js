// Next.js requires a specific version of webpack; we'll rely on that rather
// than keeping ours in sync.
/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
/* eslint-enable import/no-extraneous-dependencies */


module.exports = {
  webpack: (config) => {
    config.plugins.push(new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      API_URL: '',
    }));
    return config;
  },
  webpackDevMiddleware: (config) => {
    if (process.env.USE_POLLING === 'true') {
      Object.assign(config, {
        watchOptions: {
          poll: true,
        },
      });
    }

    return config;
  },
};
