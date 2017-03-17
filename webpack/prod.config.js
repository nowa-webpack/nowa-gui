const path = require('path');
const webpackMerge = require('webpack-merge');
const autoprefixer = require('autoprefixer');
const BabiliPlugin = require("babili-webpack-plugin");

const webpackCommon = require('./common.config');

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
// const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = webpackMerge(webpackCommon, {

  bail: true,

  devtool: 'source-map',

  entry: {
    'app': [
      './src/renderer/index.js'
    ],
    'vendor': './src/vendor.js'
  },

  output: {

    path: path.resolve(__dirname, '../app/dist'),

    filename: '[name]-[chunkhash].min.js',
    // filename: '[name].js',
    // sourceMapFilename: '[name]-[hash].map',

    // chunkFilename: '[id]-[chunkhash].js'
    chunkFilename: '[chunkhash].js'

  },

  module: {

    // TODO: use webpack old syntax to compatible with ExtractTextPlugin
    // https://github.com/webpack/extract-text-webpack-plugin/issues/275
    rules: [
      // {
      //   test: /\.css$/,
      //   loader: ExtractTextPlugin.extract({
      //     fallbackLoader: 'style-loader',
      //     loader: [
      //       'css-loader?modules&localIdentName=[name]__[local]&minimize&sourceMap&importLoaders=2',
      //       'postcss-loader',
      //       // 'sass-loader?outputStyle=expanded&sourceMap&sourceMapContents'
      //     ]
      //   })
      // }
    ]

  },
  externals(context, request, callback) {
	  let isExternal = false;
	  const load = [
	    'electron',
	  ];
	  if (load.includes(request)) {
	    isExternal = `require("${request}")`;
	  }
	  callback(null, isExternal);
	},
  plugins: [
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")   //而不是直接 'production'
      }
    }),
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '..', 'app'),
      // exclude: ['index.html']
    }),
    new BabiliPlugin(),
   
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../static/index.dist.html'),
      // excludeChunks: ['vendors'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new ExtractTextPlugin('[name].css'),
    
  ]

});
