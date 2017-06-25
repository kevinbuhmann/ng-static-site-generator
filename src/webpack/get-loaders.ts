import * as ExtractTextPlugin from 'extract-text-webpack-plugin';

export interface LoaderOptions {
  emitFiles: boolean;
  loadBlog: boolean;
}

export function getLoaders(options: LoaderOptions): any[] {
  const blogLoader = {
    test: /\.blog$/,
    loader: 'ng-static-site-generator/dist/webpack/blog-loader'
  };

  return [
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
      loader: `file-loader?emitFile=${options.emitFiles}&name=[name].[hash:20].[ext]`
    },
    {
      test: /\.(jpg|png|gif|otf|ttf|woff|woff2|cur|ani)$/,
      loader: `url-loader?emitFile=${options.emitFiles}&name=[name].[hash:20].[ext]&limit=10000`
    },
    ...(options.loadBlog ? [blogLoader] : [])
  ];
}
