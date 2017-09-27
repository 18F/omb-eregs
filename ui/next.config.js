const webpack = require('webpack');


module.exports = {
  webpack: (config) => {
    config.plugins.push(new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      API_URL: '',
    }));
    return config;
  },
};
