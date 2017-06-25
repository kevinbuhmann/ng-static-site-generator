import * as chokidar from 'chokidar';

import { NgStaticSiteGeneratorOptions } from './../lib/options';
import { BuildTask } from './build.task';

export class WatchTask extends BuildTask {
  constructor(options: NgStaticSiteGeneratorOptions) {
    super(options, true);
  }

  run() {
    let generating = false;

    const watchPaths = [this.options.blogPath];
    const watcher = chokidar.watch(watchPaths, { ignoreInitial: true });

    watcher.on('change', () => {
      if (generating === false) {
        generating = true;

        this.generateStaticSite()
          .catch(() => { process.exit(1); })
          .then(() => { generating = false; });
      }
    });

    return this.startWebpackWatch();
  }

  private startWebpackWatch() {
    const webpackCompiler = this.getWebpackCompiler();

    return new Promise<void>((resolve, reject) => {
      webpackCompiler.watch({ poll: false }, (error, stats) => { this.webpackCompilerCallback(error, stats, resolve, reject); });
    });
  }
}
