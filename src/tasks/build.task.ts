import { fork } from 'child_process';
import { unlinkSync } from 'fs';
import { join as joinPaths } from 'path';
import * as webpack from 'webpack';

import { generateStaticSiteScriptFilename, generateWebpackConfig } from './../lib/generate-webpack-config';
import { NgStaticSiteGeneratorOptions } from './../lib/options';

export class BuildTask {
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


