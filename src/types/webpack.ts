import * as webpack from 'webpack';

export type MultiCompilerHandler = (err: Error, stats: MultiStats) => void;

export interface MultiCompiler extends webpack.ICompiler {
    run(handler: MultiCompilerHandler): void;
    watch(watchOptions: webpack.MultiCompiler.WatchOptions, handler: MultiCompilerHandler): webpack.MultiWatching;
}

export interface MultiStats {
  hash: string;
  stats: webpack.Stats[];

  hasErrors(): boolean;
  hasWarnings(): boolean;
  toJson(options?: webpack.Stats.ToJsonOptions): any;
  toString(options?: webpack.Stats.ToStringOptions): string;
}

export interface StatsAsset {
  name: string;
  size: number;
  chunks: number[];
  chunkNames: string[];
  emitted: boolean;
}
