import * as webpack from 'webpack';

import { Options } from './../options';
import { generateClientAppWebpackConfig } from './generate-client-app-webpack-config';
import { generateStaticSiteWebpackConfig } from './generate-static-site-webpack-config';

export function generateWebpackConfig(options: Options) {
  const buildClientApp = options.mainPath !== undefined;

  const configurations: webpack.Configuration[] =  [];

  const buildTemplate = buildClientApp === false;
  configurations.push(generateStaticSiteWebpackConfig(options, buildTemplate));

  if (buildClientApp) {
    configurations.push(generateClientAppWebpackConfig(options));
  }

  return configurations;
}
