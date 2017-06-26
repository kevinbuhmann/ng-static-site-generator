import * as chalk from 'chalk';
import { fork } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { sync as globSync } from 'glob';
import { join as joinPaths } from 'path';
import * as webpack from 'webpack';

import { Options } from './../options';
import { MultiCompiler, MultiStats } from './../types/multi-webpack';
import { generatorScriptAssetName, templateAssetName } from './../webpack/asset-names';
import { generateWebpackConfig } from './../webpack/generate-webpack-config';
import { Task } from './task';

export class BuildTask implements Task {
  constructor(private options: Options, private watch: boolean) { }

  run() {
    return this.runWebpackBuild();
  }

  private runWebpackBuild() {
    const webpackConfig = generateWebpackConfig(this.options);
    const webpackCompiler: MultiCompiler = webpack(webpackConfig);

    return new Promise<void>((resolve, reject) => {
      if (this.watch) {
        webpackCompiler.watch({ poll: false }, (error, stats) => { this.webpackCompilerCallback(error, stats, resolve, reject); });
      } else {
        webpackCompiler.run((error, stats) => { this.webpackCompilerCallback(error, stats, resolve, reject); });
      }
    });
  }

  private webpackCompilerCallback(error: Error, multiStats: MultiStats, resolve: (value: void | PromiseLike<void>) => void, reject: () => void) {
    console.log(`\n${chalk.gray.bold('webpack build results:')}\n`);

    if (multiStats.hasErrors()) {
      console.log(multiStats.stats.map(stats => stats.toString({ colors: true })).join('\n\n'));

      if (error) {
        console.log(error.toString());
      }

      reject();
    } else {
      console.log(multiStats.stats.map(stats => stats.toString({ colors: true, children: false, chunks: false, cached: false })).join('\n\n'));
      resolve(this.generateStaticSite());
    }
  }

  private generateStaticSite() {
    return new Promise<void>((resolve, reject) => {
      this.deleteHtmlFilesExceptTemplate();
      this.executeGenerateStaticSiteScript(resolve, reject);
    });
  }

  private deleteHtmlFilesExceptTemplate() {
    const htmlFilePaths = globSync('**/*.html', { cwd: this.options.distPath })
      .filter(htmlFilePath => htmlFilePath.includes(templateAssetName) === false);

    for (const htmlFilePath of htmlFilePaths) {
      unlinkSync(joinPaths(this.options.distPath, htmlFilePath));
    }
  }

  private executeGenerateStaticSiteScript(resolve: () => void, reject: () => void) {
    const templatePath = joinPaths(this.options.distPath, templateAssetName);
    const scriptPath = joinPaths(this.options.distPath, generatorScriptAssetName);

    if (existsSync(scriptPath)) {
      console.log(`\n${chalk.gray.bold('ng-static-site-generator running...')}`);

      const scriptProcess = fork(scriptPath);

      scriptProcess.on('exit', code => {
        if (this.watch === false) {
          unlinkSync(scriptPath);
          unlinkSync(templatePath);
        }


        if (code && code > 0) {
          reject();
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  }
}
