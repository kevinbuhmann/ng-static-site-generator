#! /usr/bin/env node

import { fork } from 'child_process';
import { readFileSync, unlinkSync } from 'fs';
import { join as joinPaths } from 'path';
import * as webpack from 'webpack';

import { generateStaticSiteScriptFilename, generateWebpackConfig, Options } from './lib/generate-webpack-config';

const options: Options = JSON.parse(readFileSync('./ng-static-site-generator.json').toString());

const webpackConfig = generateWebpackConfig(options);
const webpackCompiler = webpack(webpackConfig);

webpackCompiler.run(callback);

function callback(error: Error, stats: webpack.compiler.Stats) {
  if (stats.hasErrors()) {
    console.log(stats.toString({ colors: true }));

    if (error) {
      console.log(error.toString());
    }

    process.exit(1);
  }

  console.log(stats.toString({ colors: true, children: false, chunks: false }));

  const generateStaticSiteScriptPath = joinPaths(options.distPath, `${generateStaticSiteScriptFilename}.js`);

  const generateStaticSiteProcess = fork(generateStaticSiteScriptPath);

  generateStaticSiteProcess.on('exit', code => {
    unlinkSync(generateStaticSiteScriptPath);
    process.exit(code && code > 0 ? 1 : 0);
  });
}
