import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve } from 'path';
import * as webpack from 'webpack';

const webpackNodeExternals = require('webpack-node-externals');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const VirtualModuleWebpackPlugin = require('virtual-module-webpack-plugin');

export interface Options {
  appModule: string;
  appComponent: string;
  pageUrls: string[];
  distPath: string;
  blogPath: string;
  stylesPath: string;
  templatePath: string;
}

export function generateWebpackConfig(options: Options): webpack.Configuration {
  return {
    target: 'node',
    externals: [
      webpackNodeExternals()
    ],
    entry: {
      'styles': options.stylesPath,
      'generate-static-site': './generate-static-site.ts'
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
          loader: 'file-loader?name=[name].[hash:20].[ext]'
        },
        {
          test: /\.(jpg|png|gif|otf|ttf|woff|woff2|cur|ani)$/,
          loader: 'url-loader?name=[name].[hash:20].[ext]&limit=10000'
        }
      ]
    },
    plugins: [
      new VirtualModuleWebpackPlugin({
        moduleName: './generate-static-site.ts',
        contents: generateEntryScript(options)
      }),
      new ExtractTextPlugin('styles.[hash].css'),
      new HtmlWebpackPlugin({
        template: options.templatePath,
        chunks: ['styles'],
        excludeAssets: [/style.*.js/]
      }),
      new HtmlWebpackExcludeAssetsPlugin()
    ]
  };
}

function generateEntryScript(options: Options) {
  const appModule = parseModulePath(options.appModule);
  const appComponent = parseModulePath(options.appComponent);

  return `
import 'reflect-metadata';
import 'zone.js/dist/zone-node';

import { generateStaticSite } from 'ng-static-site-generator';

import { ${appModule.name} } from '${appModule.path}';
import { ${appComponent.name} } from '${appComponent.path}';

const pageUrls = ${JSON.stringify(options.pageUrls)};
const blogPath = '${options.blogPath}';
const distPath = '${options.distPath}';

generateStaticSite(${appModule.name}, ${appComponent.name}, pageUrls, blogPath, distPath);`;
}

function parseModulePath(modulePath: string) {
  const parts = modulePath.split('#');
  return { path: parts[0], name: parts[1] };
}
