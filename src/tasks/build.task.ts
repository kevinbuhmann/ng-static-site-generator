import * as del from 'del';
import * as webpack from 'webpack';

import { Options } from './../options';
import { MultiCompiler, MultiStats, StatsAsset } from './../types/webpack';
import { generateWebpackConfig } from './../webpack/generate-webpack-config';
import { Task } from './task';

const WebpackStats = require('webpack/lib/Stats');

export class BuildTask implements Task {
  constructor(private options: Options, private watch: boolean) { }

  run() {
    return this.runWebpackBuild()
      .then(() => this.deleteUnnecessaryArtifacts());
  }

  private runWebpackBuild() {
    const webpackConfig = generateWebpackConfig(this.options, this.watch);
    const webpackCompiler: MultiCompiler = webpack(webpackConfig);

    return new Promise<void>((resolve, reject) => {
      if (this.watch) {
        webpackCompiler.watch({ poll: false }, (error, stats) => { this.webpackCompilerCallback(error, stats, resolve, reject); });
      } else {
        webpackCompiler.run((error, stats) => { this.webpackCompilerCallback(error, stats, resolve, reject); });
      }
    });
  }

  private webpackCompilerCallback(error: Error, multiStats: MultiStats, resolve: () => void, reject: () => void) {
    if (multiStats.hasErrors()) {
      this.printStats(multiStats, true);

      if (error) {
        console.log(error.toString());
      }

      reject();
    } else {
      this.printStats(multiStats);
      resolve();
    }
  }

  private printStats(multiStats: MultiStats, error = false) {
    let results: string;

    if (error) {
      results = multiStats.stats
        .map(stats => stats.toString({ colors: true }))
        .join('\n\n');
    } else {
      const assets = multiStats.stats
        .map(stats => stats.toJson({ assets: true }).assets as StatsAsset[])
        .reduce((prev, curr) => prev.concat(curr), [])
        .filter(asset => asset.name.match(/temp|styles.*\.js/) === null);

      results = assets.length ? WebpackStats.jsonToString({ assets }, true) : undefined;
    }

    if (results) {
      console.log(results);
    }
  }

  private deleteUnnecessaryArtifacts() {
    if (this.watch === false) {
      return del(['*temp*', 'styles*.js'], { cwd: this.options.distPath })
        .then(() => void 0);
    }
  }
}
