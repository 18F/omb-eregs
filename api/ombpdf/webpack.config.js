var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: __dirname,
  watch: true,
  devtool: 'inline-source-map',
  entry: {
    'main': './js/main.ts',
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
    path: path.join(__dirname, 'static/ombpdf/js/'),
    publicPath: 'static/ombpdf/js/',
    filename: '[name].bundle.js'
  }
};

if (process.env.USE_POLLING === 'true') {
  module.exports.watchOptions = {
    poll: true,
  };
}
