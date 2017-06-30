import { resolve } from 'path';
import * as webpack from 'webpack';

const webpackNodeExternals = require('webpack-node-externals');
const VirtualModuleWebpackPlugin = require('virtual-module-webpack-plugin');

import { Options } from './../options';
import { blogHashName, blogHashPath, generatorScriptName, generatorScriptPath } from './asset-names';
import { getTemplatePlugins } from './generate-client-app-webpack-config';
import { getLoaders, LoaderOptions } from './get-loaders';
import { NgStaticSiteGeneratorPlugin } from './ng-static-site-generator-plugin';

export function generateStaticSiteWebpackConfig(options: Options, watch: boolean, production: boolean, buildTemplate: boolean): webpack.Configuration {
  const loaderOptions: LoaderOptions = {
    production,
    client: false,
    emitFiles: buildTemplate,
    includeHash: watch === false
  };

  const stylesEntry = buildTemplate ? { 'styles': options.stylesPath } : { };

  return {
    target: 'node',
    externals: [
      webpackNodeExternals()
    ],
    entry: {
      [blogHashName]: blogHashPath,
      [generatorScriptName]: generatorScriptPath,
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
      rules: getLoaders(loaderOptions)
    },
    plugins: [
      new VirtualModuleWebpackPlugin({
        moduleName: blogHashPath,
        contents: options.blogPath
      }),
      new VirtualModuleWebpackPlugin({
        moduleName: generatorScriptPath,
        contents: generateEntryScript(options, production)
      }),
      ...(production ? [new webpack.NoEmitOnErrorsPlugin()] : []),
      ...(buildTemplate ? getTemplatePlugins(options, watch, production, ['styles']) : []),
      new NgStaticSiteGeneratorPlugin(options)
    ]
  };
}

function generateEntryScript(options: Options, production: boolean) {
  const appModule = parseModulePath(options.appModule);
  const appComponent = parseModulePath(options.appComponent);
  const appRoutes = parseModulePath(options.appRoutes);

  return `import 'reflect-metadata';
import 'zone.js/dist/zone-node';

import { generateStaticSite } from 'ng-static-site-generator/dist/lib/generate-static-site';

import { ${appModule.name} } from '${appModule.path}';
import { ${appComponent.name} } from '${appComponent.path}';
import { ${appRoutes.name} } from '${appRoutes.path}';

generateStaticSite(${appModule.name}, ${appComponent.name}, ${appRoutes.name}, ${JSON.stringify(options)}, ${production});`;
}

function parseModulePath(modulePath: string) {
  const parts = modulePath.split('#');
  return { path: parts[0], name: parts[1] };
}
