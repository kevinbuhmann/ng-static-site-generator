import * as chalk from 'chalk';
import { fork } from 'child_process';
import { unlinkSync } from 'fs';
import { join as joinPaths } from 'path';
import * as webpack from 'webpack';

import { generateStaticSiteScriptFilename, generateWebpackConfig } from './../lib/generate-webpack-config';
import { NgStaticSiteGeneratorOptions } from './../lib/options';
import { Task } from './task';

export class BuildTask implements Task {
  constructor(private options: NgStaticSiteGeneratorOptions) { }

  run() {
    return this.runWebpackBuild()
      .then(() => this.generateStaticSite());
  }

  private runWebpackBuild() {
    const webpackConfig = generateWebpackConfig(this.options);
    const webpackCompiler = webpack(webpackConfig);

    return new Promise<void>((resolve, reject) => {
      webpackCompiler.run((error, stats) => { this.webpackCompilerCallback(error, stats, resolve, reject); });
    });
  }

  private generateStaticSite() {
    const generateStaticSiteScriptDistPath = joinPaths(this.options.distPath, `${generateStaticSiteScriptFilename}.js`);

    return new Promise<void>((resolve, reject) => {
      console.log(`\n${chalk.gray.bold('ng-static-site-generator results:')}\n`);

      const generateStaticSiteProcess = fork(generateStaticSiteScriptDistPath);

      generateStaticSiteProcess.on('exit', code => {
        unlinkSync(generateStaticSiteScriptDistPath);

        if (code && code > 0) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  private webpackCompilerCallback(error: Error, stats: webpack.Stats, resolve: () => void, reject: () => void) {
    console.log(`\n${chalk.gray.bold('webpack build results:')}\n`);

    if (stats.hasErrors()) {
      console.log(stats.toString({ colors: true }));

      if (error) {
        console.log(error.toString());
      }

      reject();
    } else {
      console.log(stats.toString({ colors: true, children: false, chunks: false }));
      resolve();
    }
  }
}


