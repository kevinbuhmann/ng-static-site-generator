import * as webpack from 'webpack';

import { generateClientAppWebpackConfig } from './generate-client-app-webpack-config';
import { generateStaticSiteWebpackConfig } from './generate-static-site-webpack-config';
import { NgStaticSiteGeneratorOptions } from './options';

export function generateWebpackConfig(options: NgStaticSiteGeneratorOptions): webpack.Configuration[] {
  return [
    generateClientAppWebpackConfig(options),
    generateStaticSiteWebpackConfig(options)
  ];
}
