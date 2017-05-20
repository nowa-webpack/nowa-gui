const webpackMerge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const { resolve } = require('path');

const webpackCommon = require('./base.conf');

const outputDir = resolve(__dirname, '..', 'app');

module.exports = webpackMerge(webpackCommon,
  {
    target: 'electron-renderer',
    bail: true,
    entry: {
      vendor: './src/renderer/vendor.js',
      renderer: './src/renderer/index.js',
    },
    output: {
      path: resolve(outputDir, 'renderer'),
      // filename: '[name].js',
      filename: '[name]-[chunkhash].min.js',
      chunkFilename: '[chunkhash].js'
    },
    module: {
      rules: [{
        test: /\.js$/,
        include: resolve(__dirname, '..', 'src'),
        // exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        },
      }, {
        test: /\.(css|less)$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          use: [{
            loader: 'css-loader',
            options: {
              modules: false,
              importLoaders: 2,
              minimize: true,
              sourceMap: true,
            }
          },'less-loader'],
          fallback: 'style-loader',
        }),
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader',
          fallback: 'style-loader',
        })
      },]
    },
    // externals: {
    //   electron: 'electron',
    // },
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new CleanWebpackPlugin(['renderer'], {
        root: outputDir,
        // exclude: ['index.html']
      }),
      new CommonsChunkPlugin({
        name: ['vendor', 'manifest'],
        minChunks: Infinity
      }),
      new ExtractTextPlugin('style.css'),
      new HtmlWebpackPlugin({
        inject: true,
        template: resolve(__dirname, '../static/index.dist.html'),
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
      new BabiliPlugin(),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: resolve(__dirname, 'analyzer-report.html'),
      })
    ],
});
