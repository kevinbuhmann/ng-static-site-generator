import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { realpathSync } from 'fs';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { join as joinPaths, resolve } from 'path';
import * as webpack from 'webpack';

const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

import { Options } from './../options';
import { templateAssetName } from './asset-names';
import { getLoaders } from './get-loaders';

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
      rules: getLoaders({ emitFiles: true, loadBlog: false })
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
      filename: templateAssetName,
      excludeAssets: [/style.*.js/]
    }),
    new HtmlWebpackExcludeAssetsPlugin()
  ];
}
