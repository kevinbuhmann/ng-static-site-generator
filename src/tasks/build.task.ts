import * as del from 'del';
import * as webpack from 'webpack';

import { Options } from './../options';
import { MultiCompiler, MultiStats, StatsAsset } from './../types/webpack';
import { generateWebpackConfig } from './../webpack/generate-webpack-config';
import { Task } from './task';

const WebpackStats = require('webpack/lib/Stats');

export enum BuildMode {
  Build,
  Watch,
  ProductionBuild
}

export class BuildTask implements Task {
  readonly watch: boolean;
  readonly production: boolean;

  constructor(mode: BuildMode, private options: Options) {
    this.watch = mode === BuildMode.Watch;
    this.production = mode === BuildMode.ProductionBuild;
  }

  run() {
    return this.runWebpackBuild()
      .then(() => this.deleteUnnecessaryArtifacts());
  }

  private runWebpackBuild() {
    const webpackConfig = generateWebpackConfig(this.options, this.watch, this.production);
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
    if (error || multiStats.hasErrors()) {
      if (multiStats) {
        this.printStats(multiStats, true);
      }

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
      const excludePattern = this.production ? /temp|styles.*\.js/ : /temp/;

      const assets = multiStats.stats
        .map(stats => stats.toJson({ assets: true }).assets as StatsAsset[])
        .reduce((prev, curr) => prev.concat(curr), [])
        .filter(asset => asset.name.match(excludePattern) === null);

      results = assets.length ? WebpackStats.jsonToString({ assets }, true) : undefined;
    }

    if (results) {
      console.log(results);
    }
  }

  private deleteUnnecessaryArtifacts() {
    if (this.watch === false) {
      const filesToDelete = [
        '*temp*',
        ...(this.production ? ['styles*.js'] : [])
      ];

      return del(filesToDelete, { cwd: this.options.distPath })
        .then(() => void 0);
    }
  }
}
