const path = require('path');

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');


module.exports = [
  {
    entry: path.join(__dirname, 'reqs', 'static', 'js', 'index.js'),
    output: {
      path: __dirname,
      filename: path.join('reqs', 'static', 'js', 'bundle.js'),
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015'],
          },
        },
        {
          test: /\.js$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          loaders: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },
  },
  {
    target: 'node',
    entry: path.join(__dirname, 'ui', 'server.js'),
    output: {
      path: path.join(__dirname, 'ui-dist'),
      filename: 'server.js',
    },
    externals: [nodeExternals()],
    plugins: [
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false,
      }),
    ],
    devtool: 'sourcemap',
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: 'babel-loader',
          query: { presets: ['es2015'] },
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: 'eslint-loader',
        },
      ],
    },
  },
];
