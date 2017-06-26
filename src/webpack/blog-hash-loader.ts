import { resolve } from 'path';
import * as webpack from 'webpack';

const folderHash = require('folder-hash');

module.exports = function blogHashLoader(this: webpack.loader.LoaderContext, blogPath: string) {
  const callback = this.async();

  this.addContextDependency(resolve(blogPath));

  folderHash.hashElement(blogPath)
    .then((blogHash: any) => JSON.stringify({blogHash}))
    .then((json: string) => `module.exports = ${json};`)
    .then((result: string) => { callback(undefined, result); })
    .catch((error: any) => { callback(error); });
};
