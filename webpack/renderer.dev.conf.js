const { resolve } = require('path');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');
// const AnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;

const webpackCommon = require('./base.conf');

const outputDir = resolve(__dirname, '..', 'app');


module.exports = webpackMerge(webpackCommon, 
  {
    target: 'electron-renderer',
    // target: 'web',
    devtool: 'cheap-module-eval-source-map',
    entry: {
      app: [
        'babel-polyfill',
        './src/renderer/index.js'
      ],
    },
    output: {
      path: resolve(outputDir, 'renderer'),
      filename: '[name].js',
      publicPath: '/'
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
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              importLoaders: 2,
              sourceMap: true
            },
          },
          'less-loader',
        ]
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              sourceMap: true
            },
          },
        ]
      },]
    },
    devServer: {
      // contentBase: resolve(outputDir, 'renderer'),
      publicPath: '/',
      compress: true,
      historyApiFallback: true,
      hot: true,
      https: false,
      // noInfo: true,
      // watchContentBase: true,
      port: 9000
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: resolve(__dirname, '..', 'static', 'index.html'),
      }),
      new DllReferencePlugin({
        manifest: require(resolve(__dirname, '..', 'dll', 'manifest.dll.json')),
        sourceType: 'var',
      }),
      // new AnalyzerPlugin(resolve(__dirname, 'plain-report.txt')),
      new HotModuleReplacementPlugin(),
    ]
  });
