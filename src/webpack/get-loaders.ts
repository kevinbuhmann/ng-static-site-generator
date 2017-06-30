import * as ExtractTextPlugin from 'extract-text-webpack-plugin';

import { blogHashName } from './asset-names';

export interface LoaderOptions {
  client: boolean;
  production: boolean;
  emitFiles: boolean;
  includeHash: boolean;
}

export function getLoaders(options: LoaderOptions): any[] {
  const fileLoaderOptions = `emitFile=${options.emitFiles}&name=${options.includeHash ? '[name].[hash:20].[ext]' : '[name].[ext]'}`;

  return [
    {
      test: /\.ts$/,
      use: options.client ? ['@ngtools/webpack'] : ['awesome-typescript-loader', 'angular2-template-loader']
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
      use: options.production ? ExtractTextPlugin.extract({ fallback: 'style-loader',  use: ['css-loader', 'sass-loader'] }) : ['style-loader', 'css-loader', 'sass-loader']
    },
    {
      test: /\.(eot|svg)$/,
      loader: `file-loader?${fileLoaderOptions}`
    },
    {
      test: /\.(jpg|png|gif|otf|ttf|woff|woff2|cur|ani)$/,
      loader: `url-loader?${fileLoaderOptions}&limit=10000`
    },
    {
      test: new RegExp(blogHashName),
      loader: 'ng-static-site-generator/dist/webpack/blog-hash-loader'
    }
  ];
}
