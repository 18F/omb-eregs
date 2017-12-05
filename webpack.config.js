var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: __dirname,
  watch: true,
  entry: {
    'main': './ombpdf/webapp/js/main.js',
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry'
  },
  output: {
    path: path.join(__dirname, 'ombpdf/webapp/static/js/'),
    publicPath: 'static/js/',
    filename: '[name].bundle.js'
  }
};
