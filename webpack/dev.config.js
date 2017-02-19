const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const webpackCommon = require('./common.config');


const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');

// const outputPath = path.join(__dirname, 'app', 'dist');

module.exports = webpackMerge(webpackCommon, {

  devtool: 'inline-source-map',

  entry: {
    'app': [
      // 'webpack-dev-server/client?http://' + require("ip").address() + ':3000/',
      'webpack-dev-server/client',
      'webpack/hot/only-dev-server',
      'react-hot-loader/patch',
      './src/renderer/index.js'
    ],
    'vendor': './src/vendor.js'
  },

  output: {

    path: path.resolve(__dirname, '../app/dist'),

    filename: '[name].js',

    // sourceMapFilename: '[name].map',

    // chunkFilename: '[id]-chunk.js',

    publicPath: '/'

  },

  module: {

    rules: [
      // {
      //   test: /\.css$/,
      //   loader: ExtractTextPlugin.extract({
      //     fallbackLoader: 'style-loader',
      //     loader: [
      //       'css-loader?modules&localIdentName=[name]__[local]&minimize&sourceMap&importLoaders=2',
      //       'postcss-loader',
      //     ]
      //   })
      // }
    ]

  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../static/index.html'),
      // favicon: path.resolve(__dirname, '../static/favicon.ico')
    }),
    new ExtractTextPlugin('[name].css'),
    new webpack.HotModuleReplacementPlugin(),
    
  ],

  // devServer: {
  //   host: 'localhost',
  //   port: 3010,
  //   // open: true,
  //   hot: true,
  //   stats: { chunks: false },
  //   historyApiFallback: true,
  //   watchOptions: {
  //     aggregateTimeout: 300,
  //     poll: 1000
  //   },
  // },
  performance: {
    hints: false
  }

});
