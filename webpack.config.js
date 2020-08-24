/*
 * @Author: your name
 * @Date: 2020-08-24 18:44:13
 * @LastEditTime: 2020-08-24 19:08:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /webpack-dll-demo/webpack.config.js
 */
const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FirendlyErrorePlugin = require('friendly-errors-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'build-[hash:5].js',
  },
  plugins: [
    new HTMLWebpackPlugin({
      title: 'Webpak DllPlugin 的使用',
      template: './public/index.html',
    }),
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['dist'],
    }),
    new FirendlyErrorePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    // 告诉 Webpack 使用了哪些动态链接库
    new webpack.DllReferencePlugin({
      // 描述 lodash 动态链接库的文件内容
      manifest: require('./public/vendor/lodash.manifest.json'),
    }),
    // 该插件将把给定的 JS 或 CSS 文件添加到 webpack 配置的文件中，并将其放入资源列表 html webpack插件注入到生成的 html 中。
    new AddAssetHtmlPlugin([
      {
        // 要添加到编译中的文件的绝对路径，以及生成的HTML文件。支持globby字符串
        filepath: require.resolve(
          path.resolve(__dirname, 'public/vendor/lodash.dll.js')
        ),
        // 文件输出目录
        outputPath: 'vendor',
        // 脚本或链接标记的公共路径
        publicPath: 'vendor',
      },
    ]),
  ],
};
