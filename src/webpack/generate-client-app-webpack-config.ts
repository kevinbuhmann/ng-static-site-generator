import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { realpathSync } from 'fs';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { join as joinPaths, resolve } from 'path';
import * as webpack from 'webpack';

const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

import { Options } from './../options';

export const templateFilename = 'template.html';

const nodeModules = joinPaths(process.cwd(), 'node_modules');
const realNodeModules = realpathSync(nodeModules);

export function generateClientAppWebpackConfig(options: Options): webpack.Configuration {
  const polyfillsEntry = options.polyfillsPath ? { 'polyfills': options.polyfillsPath } : { };

  return {
    target: 'web',
    entry: {
      'main': options.mainPath,
      'styles': options.stylesPath,
      ...polyfillsEntry
    },
    output: {
      path: resolve(options.distPath),
      filename: '[name].[hash].js'
    },
    resolve: {
      extensions: ['.js', '.ts']
    },
    module: {
      exprContextCritical: false,
      rules: [
        {
          test: /\.ts$/,
          use: ['awesome-typescript-loader', 'angular2-template-loader']
        },
        {
          test: /\.html$/,
          use: ['html-loader']
        },
        {
          test: /\.css$/,
          use: ['to-string-loader', 'css-loader']
        },
        {
          test: /\.scss$/,
          use: ['to-string-loader', 'css-loader', 'sass-loader'],
          exclude: [/styles/]
        },
        {
          test: /styles\.scss$/,
          use: ExtractTextPlugin.extract({ fallback: 'style-loader',  use: ['css-loader', 'sass-loader'] })
        },
        {
          test: /\.(eot|svg)$/,
          loader: 'file-loader?name=[name].[hash:20].[ext]'
        },
        {
          test: /\.(jpg|png|gif|otf|ttf|woff|woff2|cur|ani)$/,
          loader: 'url-loader?name=[name].[hash:20].[ext]&limit=10000'
        }
      ]
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: ['main'],
        minChunks: (module) => module.resource && (module.resource.startsWith(nodeModules) || module.resource.startsWith(realNodeModules))
      }),
      ...getTemplatePlugins(options, ['styles', 'main', 'vendor', 'polyfills'])
    ]
  };
}

export function getTemplatePlugins(options: Options, chunks: string[]) {
  return [
    new ExtractTextPlugin('styles.[hash].css'),
    new HtmlWebpackPlugin({
      chunks,
      template: options.templatePath,
      filename: templateFilename,
      excludeAssets: [/style.*.js/]
    }),
    new HtmlWebpackExcludeAssetsPlugin()
  ];
}
