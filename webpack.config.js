module.exports = {
    entry: "./reqs/static/js/index.js",
    output: {
        path: __dirname,
        filename: "./reqs/static/js/bundle.js"
    },
    module: {
        loaders: [
          {
           test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loaders: ['babel-loader', "eslint-loader"],
            query: {
              presets: ['es2015']
            }
          },
          {
            test: /\.scss$/,
            loaders: ["style-loader", "css-loader", "sass-loader"]
          }
        ]
    }
};
