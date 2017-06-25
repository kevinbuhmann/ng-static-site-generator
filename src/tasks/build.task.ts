
import * as chalk from 'chalk';
import { fork } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { sync as globSync } from 'glob';
import { join as joinPaths } from 'path';
import * as webpack from 'webpack';

import { generateStaticSiteScriptFilename, generateWebpackConfig, templateFilename } from './../lib/generate-webpack-config';
import { NgStaticSiteGeneratorOptions } from './../lib/options';
import { Task } from './task';

export class BuildTask implements Task {
  constructor(protected options: NgStaticSiteGeneratorOptions, private isWatchTask = false) { }

  run() {
    return this.runWebpackBuild();
  }

  protected getWebpackCompiler() {
    const webpackConfig = generateWebpackConfig(this.options);
    return webpack(webpackConfig);
  }

  protected generateStaticSite() {
    return new Promise<void>((resolve, reject) => {
      this.deleteHtmlFilesExceptTemplate();
      this.executeGenerateStaticSiteScript(resolve, reject);
    });
  }

  protected webpackCompilerCallback(error: Error, stats: webpack.Stats, resolve: (value: void | PromiseLike<void>) => void, reject: () => void) {
    console.log(`\n${chalk.gray.bold('webpack build results:')}\n`);

    if (stats.hasErrors()) {
      console.log(stats.toString({ colors: true }));

      if (error) {
        console.log(error.toString());
      }

      reject();
    } else {
      console.log(stats.toString({ colors: true, children: false, chunks: false }));
      resolve(this.generateStaticSite());
    }
  }

  private runWebpackBuild() {
    const webpackCompiler = this.getWebpackCompiler();

    return new Promise<void>((resolve, reject) => {
      webpackCompiler.run((error, stats) => { this.webpackCompilerCallback(error, stats, resolve, reject); });
    });
  }

  private deleteHtmlFilesExceptTemplate() {
    const htmlFilePaths = globSync('**/*.html', { cwd: this.options.distPath })
      .filter(htmlFilePath => htmlFilePath.includes(templateFilename) === false);

    for (const htmlFilePath of htmlFilePaths) {
      unlinkSync(joinPaths(this.options.distPath, htmlFilePath));
    }
  }

  private executeGenerateStaticSiteScript(resolve: () => void, reject: () => void) {
    const templatePath = joinPaths(this.options.distPath, templateFilename);
    const scriptPath = joinPaths(this.options.distPath, `${generateStaticSiteScriptFilename}.js`);

    if (existsSync(scriptPath)) {
      console.log(`\n${chalk.gray.bold('ng-static-site-generator running...')}`);

      const scriptProcess = fork(scriptPath);

      scriptProcess.on('exit', code => {
        if (this.isWatchTask === false) {
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
