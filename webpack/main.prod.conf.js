const webpackMerge = require('webpack-merge');
const BabiliPlugin = require('babili-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const { resolve } = require('path');

const webpackCommon = require('./main.dev.conf');
const outputDir = resolve(__dirname, '..', 'app');

module.exports = {
  target: 'electron-main',
  entry: resolve(outputDir, 'main.js'),
  output: {
    path: outputDir,
    // filename: '[name].js',
    filename: 'main.min.js',
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // new UglifyJSPlugin(),
    new BabiliPlugin(),
  ],
}

/*module.exports = webpackMerge(webpackCommon,
  {
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      // new UglifyJSPlugin(),
      new BabiliPlugin(),
    ],
});*/
