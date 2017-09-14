const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = [
  {
    name: 'styles',
    entry: path.join(__dirname, 'assets', 'css', 'main.scss'),
    output: {
      path: path.join(__dirname, 'dist', 'static'),
      filename: 'styles.css',
    },
    devtool: 'source-map',
    module: {
      loaders: [
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader',
                options: { sourceMap: true } },
              { loader: 'sass-loader',
                options: { sourceMap: true } },
            ],
          }),
        },
      ],
    },
    plugins: [
      new ExtractTextPlugin('styles.css'),
      new CopyWebpackPlugin([
          { from: 'assets/font/*', to: 'font', flatten: true },
          { from: 'assets/img/*', to: 'img', flatten: true },
          { from: 'ie.js', to: '' }
      ]),
    ],
  },
  {
    name: 'browser-js',
    devtool: 'sourcemap',
    entry: ['babel-polyfill', path.join(__dirname, 'browser.js')],
    output: {
      path: path.join(__dirname, 'dist', 'static'),
      filename: 'browser.js',
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.jsx?$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
  },
  {
    name: 'server-js',
    target: 'node',
    entry: path.join(__dirname, 'server.js'),
    output: {
      path: path.join(__dirname, 'dist'),
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
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loaders: 'babel-loader',
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loaders: 'eslint-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
  },
];
