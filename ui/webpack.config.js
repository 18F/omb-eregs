const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = [
  {
    name: 'styles',
    entry: path.join(__dirname, 'css', 'main.scss'),
    output: {
      path: path.join(__dirname, 'static'),
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
    plugins: [new ExtractTextPlugin('styles.css')],
  },
];
