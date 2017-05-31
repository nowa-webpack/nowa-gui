const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const cssImport = require('postcss-import');
const cssNested = require('postcss-nested');
const path = require('path');

module.exports = {
  target: "electron-renderer",

  resolve: {

    extensions: ['.js', '.jsx', '.css'],

    modules: ['node_modules'],

    alias: {
      // language: path.join(__dirname, '..', 'src', 'i18n'),
      i18n: path.join(__dirname, '..', 'src', 'renderer', 'services', 'i18n'),
      'gui-util': path.join(__dirname, '..', 'src', 'renderer', 'util'),
      'gui-local': path.join(__dirname, '..', 'src', 'renderer', 'services', 'localStorage'),
      'gui-const': path.join(__dirname, '..', 'src', 'renderer', 'constants'),
      'gui-request': path.join(__dirname, '..', 'src', 'renderer', 'services', 'request'),
    }

  },

  module: {

    rules: [
    {
      test: /\.js$/,
      // include: './src/',
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        cacheDirectory: true,
      },
    },
    /*{
      test: /\.css$/,
      exclude: /node_modules/,
      loader: ExtractTextPlugin.extract({
        fallbackLoader: 'style-loader',
        loader: [
          // 'css-loader?modules&localIdentName=[name]__[local]&minimize&sourceMap&importLoaders=2',
          'css-loader?localIdentName=[name]__[local]&minimize&sourceMap&importLoaders=2',
          // 'css-loader?localIdentName=[name]__[local]&minimize&sourceMap&importLoaders=2',
          'postcss-loader',
        ]
      })
    },*/
    {
      test: /\.css$/,
      exclude: /node_modules/,
      loader: ExtractTextPlugin.extract({
        fallbackLoader: 'style-loader',
        loader: [
          'css-loader?minimize&importLoaders=2',
          'less-loader',
        ]
      })
    },
    {
      test: /\.css$/,
      include: /node_modules/,
      loader: ExtractTextPlugin.extract({
        fallbackLoader: 'style-loader',
        loader: [
          'css-loader?minimize',
          // 'postcss-loader',
        ]
      })
    },
    {
      test: /\.less$/,
      // include: /node_modules/,
      loader: ExtractTextPlugin.extract({
        fallbackLoader: 'style-loader',
        loader: [
          'css-loader?minimize&importLoaders=2',
          'less-loader',
        ]
      })
    },
    // {
    //   test: /\.ejs$/,
    //   // include: /node_modules/,
    //   loader: 'ejs-loader?variable=data'
    // },
    {
      test: /\.(mp4|webm)$/,
      loader: 'url-loader?limit=10000'
    },
    { test: /\.woff2{0,1}$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
    { test: /\.(otf|eot|svg|ttf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
    { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192'}
    ]

  },


  plugins: [
    new CommonsChunkPlugin({
      name: ['vendor', 'manifest'],
      minChunks: Infinity
    }),
    // new LoaderOptionsPlugin({
    //   options: {
    //     context: '/',
    //     postcss: function () {
    //       return [autoprefixer, cssImport, cssNested];
    //     }
    //   }
    // })
  ]

};