var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: __dirname,
  watch: true,
  entry: {
    'main': './js/main.js',
    'prosemirror-fun': './js/prosemirror-fun/main.js',
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
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
