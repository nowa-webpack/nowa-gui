const webpackMerge = require('webpack-merge');
const BabiliPlugin = require('babili-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');

const webpackCommon = require('./main.dev.conf');

module.exports = webpackMerge(webpackCommon,
  {
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      // new UglifyJSPlugin(),
      new BabiliPlugin(),
    ],
});
