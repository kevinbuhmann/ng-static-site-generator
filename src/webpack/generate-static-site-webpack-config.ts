import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { resolve } from 'path';
import * as webpack from 'webpack';

const webpackNodeExternals = require('webpack-node-externals');
const VirtualModuleWebpackPlugin = require('virtual-module-webpack-plugin');

import { NgStaticSiteGeneratorOptions } from './../lib/options';
import { getTemplatePlugins } from './generate-client-app-webpack-config';

export const generateStaticSiteScriptFilename = 'generate-static-site';
const generateStaticSiteScriptPath = `./${generateStaticSiteScriptFilename}.ts`;

const blogEntry = 'blog';
const blogEntryPath = `./${blogEntry}.blog`;

export function generateStaticSiteWebpackConfig(options: NgStaticSiteGeneratorOptions, buildTemplate: boolean): webpack.Configuration {
  const emitFiles = buildTemplate;
  const stylesEntry = buildTemplate ? { 'styles': options.stylesPath } : { };

  return {
    target: 'node',
    externals: [
      webpackNodeExternals()
    ],
    entry: {
      [generateStaticSiteScriptFilename]: generateStaticSiteScriptPath,
      ...stylesEntry
    },
    output: {
      path: resolve(options.distPath),
      filename: '[name].js'
    },
    resolve: {
      extensions: ['.js', '.ts']
    },
    module: {
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
          loader: `file-loader?emitFile=${emitFiles}&name=[name].[hash:20].[ext]`
        },
        {
          test: /\.(jpg|png|gif|otf|ttf|woff|woff2|cur|ani)$/,
          loader: `url-loader?emitFile=${emitFiles}&name=[name].[hash:20].[ext]&limit=10000`
        },
        {
          test: /\.blog$/,
          loader: 'ng-static-site-generator/dist/webpack/blog-loader'
        }
      ]
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new VirtualModuleWebpackPlugin({
        moduleName: blogEntryPath,
        contents: options.blogPath
      }),
      new VirtualModuleWebpackPlugin({
        moduleName: generateStaticSiteScriptPath,
        contents: generateEntryScript(options)
      }),
      ...(buildTemplate ? getTemplatePlugins(options, ['styles']) : [])
    ]
  };
}

function generateEntryScript(options: NgStaticSiteGeneratorOptions) {
  const appModule = parseModulePath(options.appModule);
  const appComponent = parseModulePath(options.appComponent);
  const appRoutes = parseModulePath(options.appRoutes);

  return `import 'reflect-metadata';
import 'zone.js/dist/zone-node';

import { generateStaticSite } from 'ng-static-site-generator/dist/lib/generate-static-site';

import { ${appModule.name} } from '${appModule.path}';
import { ${appComponent.name} } from '${appComponent.path}';
import { ${appRoutes.name} } from '${appRoutes.path}';

// This triggers the blog loader which adds a context dependency on the blog path for the watch build mode.
const nothing = require('${blogEntryPath}');

generateStaticSite(${appModule.name}, ${appComponent.name}, ${appRoutes.name}, '${options.blogPath}', '${options.distPath}');`;
}

function parseModulePath(modulePath: string) {
  const parts = modulePath.split('#');
  return { path: parts[0], name: parts[1] };
}
