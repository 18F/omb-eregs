const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
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
        { from: 'assets/img/favicon/*', to: 'img/favicon', flatten: true },
        { from: 'ie.js', to: '' },
      ]),
    ],
  },
];
