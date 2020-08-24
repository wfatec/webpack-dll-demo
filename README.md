<!--
 * @Author: your name
 * @Date: 2020-08-24 19:17:31
 * @LastEditTime: 2020-08-24 19:28:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /webpack-dll-demo/README.md
-->

## Webpack DllPlugin 配置

> 使用 `DllPlugin` 和 `DllReferencePlugin` 实现动态链接库 dll，提高开发效率，原文 - [使用 Webpack 的 DllPlugin 提升项目构建速度](https://juejin.im/post/6844903777296728072)

主要分为两个步骤：

### 1. 编写一个配置文件专门用来编译生成动态链接库（使用 DllPlugin）

```javascript
// webpack_dll.config.js
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FirendlyErrorePlugin = require('friendly-errors-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    // 将 lodash 模块作为入口编译成动态链接库
    lodash: ['lodash'],
  },
  output: {
    // 指定生成文件所在目录
    // 由于每次打包生产环境时会清空 dist 文件夹，因此这里我将它们存放在了 public 文件夹下
    path: path.resolve(__dirname, 'public/vendor'),
    // 指定文件名
    filename: '[name].dll.js',
    // 存放动态链接库的全局变量名称，例如对应 lodash 来说就是 lodash_dll_lib
    // 这个名称需要与 DllPlugin 插件中的 name 属性值对应起来
    // 之所以在前面 _dll_lib 是为了防止全局变量冲突
    library: '[name]_dll_lib',
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: path.resolve(__dirname, 'public/vendor'),
    }),
    new FirendlyErrorePlugin(),

    // 接入 DllPlugin
    new webpack.DllPlugin({
      // 描述动态链接库的 manifest.json 文件输出时的文件名称
      // 由于每次打包生产环境时会清空 dist 文件夹，因此这里我将它们存放在了 public 文件夹下
      path: path.join(__dirname, 'public', 'vendor', '[name].manifest.json'),
      // 动态链接库的全局变量名称，需要和 output.library 中保持一致
      // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
      // 例如 lodash.manifest.json 中就有 "name": "lodash_dll_lib"
      name: '[name]_dll_lib',
    }),
  ],
};
```

### 2. 编写配置文件用来打包项目（使用 DllReferencePlugin）

```javascript
// webpack_dll.config.js
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
```

其中 `add-asset-html-webpack-plugin` 用于在入口 html 中自动插入 `DllPlugin` 生成的动态链接库脚本。