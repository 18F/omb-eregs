const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');


module.exports = [
  {
    name: 'editor-js',
    context: __dirname,
    devtool: 'inline-source-map',
    entry: {
      'document.main': './document/js/main.ts',
      'ombpdf.main': './ombpdf/js/main.ts',
      'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    output: {
      path: path.join(__dirname, 'webpack-static/bundles/js/'),
      publicPath: 'static/bundles/js/',
      filename: '[name].bundle.js',
    },
  },
  {
    name: 'admin-styles',
    context: __dirname,
    devtool: 'source-map',
    entry: path.join(__dirname, 'ereqs_admin', 'static', 'admin', 'override.scss'),
    output: {
      path: path.join(__dirname, 'webpack-static', 'bundles', 'css', 'admin'),
      publicPath: 'static/bundles/css/admin/',
      filename: 'override.css',
    },
    plugins: [new ExtractTextPlugin('override.css')],
    module: {
      rules: [{
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
      }],
    },
  },
];

if (process.env.USE_POLLING === 'true') {
  module.exports.forEach(exp => {
    exp.watchOptions = { poll: true };
  });
}
