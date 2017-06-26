import { resolve } from 'path';
import * as webpack from 'webpack';

module.exports = function blogLoader(this: webpack.loader.LoaderContext, blogPath: string) {
  this.addContextDependency(resolve(blogPath));
  return '';
};
