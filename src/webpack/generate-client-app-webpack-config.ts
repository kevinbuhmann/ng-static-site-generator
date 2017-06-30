import { AotPlugin } from '@ngtools/webpack';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { realpathSync } from 'fs';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { join as joinPaths, resolve } from 'path';
import * as webpack from 'webpack';

const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const VirtualModuleWebpackPlugin = require('virtual-module-webpack-plugin');

import { GeneratorOptions } from './../options';
import { blogHashName, blogHashPath, templateAssetName } from './asset-names';
import { getLoaders, LoaderOptions } from './get-loaders';
import { NgStaticSiteGeneratorPlugin } from './ng-static-site-generator-plugin';

const nodeModules = joinPaths(process.cwd(), 'node_modules');
const realNodeModules = realpathSync(nodeModules);

const entryPoints = ['polyfills', 'styles', 'vendor', 'main'];

export function generateClientAppWebpackConfig(options: GeneratorOptions, watch: boolean, production: boolean): webpack.Configuration {
  const loaderOptions: LoaderOptions = {
    production,
    client: true,
    emitFiles: true,
    includeHash: watch === false
  };

  const polyfillsEntry = options.polyfillsPath ? { 'polyfills': options.polyfillsPath } : { };

  return {
    target: 'web',
    entry: {
      'main': options.mainPath,
      'styles': options.stylesPath,
      [blogHashName]: blogHashPath,
      ...polyfillsEntry
    },
    output: {
      path: resolve(options.distPath),
      filename: watch ? '[name].js' : '[name].[hash].js'
    },
    resolve: {
      extensions: ['.js', '.ts']
    },
    module: {
      exprContextCritical: false,
      rules: getLoaders(loaderOptions)
    },
    plugins: [
      new VirtualModuleWebpackPlugin({
        moduleName: blogHashPath,
        contents: options.blogPath
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: ['main'],
        minChunks: (module) => module.resource && (module.resource.startsWith(nodeModules) || module.resource.startsWith(realNodeModules))
      }),
      new AotPlugin({
        mainPath: options.mainPath,
        tsConfigPath: options.tsConfigPath,
        skipCodeGeneration: production === false,
        hostReplacementPaths: {
          ...(options.environmentSource ? { [options.environmentSource]: options.environments[production ? 'prod' : 'dev'] } : { })
        },
        exclude: []
      }),
      ...(production ? [new webpack.optimize.UglifyJsPlugin()] : []),
      ...(production ? [new webpack.NoEmitOnErrorsPlugin()] : []),
      ...getTemplatePlugins(options, watch, production, ['styles', 'main', 'vendor', 'polyfills']),
      new NgStaticSiteGeneratorPlugin(options)
    ]
  };
}

export function getTemplatePlugins(options: GeneratorOptions, watch: boolean, production: boolean, chunks: string[]) {
  return [
    ...(production ? [new ExtractTextPlugin(watch ? 'style.css' : 'styles.[hash].css')] : []),
    new HtmlWebpackPlugin({
      chunks,
      template: options.templatePath,
      filename: templateAssetName,
      excludeAssets: production ? [/style.*\.js/] : [],
      chunksSortMode: (left, right) => entryPoints.indexOf(left.names[0]) - entryPoints.indexOf(right.names[0])
    }),
    new HtmlWebpackExcludeAssetsPlugin()
  ];
}
