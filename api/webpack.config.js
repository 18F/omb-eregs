var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: __dirname,
  devtool: 'inline-source-map',
  entry: {
    'ombpdf.main': './ombpdf/js/main.ts',
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
  output: {
    path: path.join(__dirname, 'webpack-static/bundles/js/'),
    publicPath: 'static/bundles/js/',
    filename: '[name].bundle.js'
  }
};

if (process.env.USE_POLLING === 'true') {
  module.exports.watchOptions = {
    poll: true,
  };
}
